/**
 * Houses all the functions for Access Token API Access
**/
module.exports = function(lib) {
    let { ipcMain, win, store } = lib;

    const fetch = require('electron-fetch').default;

    /*
    UserName to ID
    */
    ipcMain.on('ownerConvertToId', async (event, data) => {
        let { client_id, client_secret, login } = data;

        if (!client_id || client_id == '') {
            win.webContents.send('errorMsg', 'Client ID is required');
            return;
        }
        if (!client_secret || client_secret == '') {
            win.webContents.send('errorMsg', 'Twitch API Client Secret is required');
            return;
        }

        store.set(`extensions.${client_id}.client_id`, client_id);
        store.set(`extensions.${client_id}.client_secret`, client_secret);

        convertToId({
            client_id,
            login,
            el: 'user_id'
        })
    });

    ipcMain.on('convertToId', async (event, data) => {
        console.log('convertToId', data);
        data.client_id = store.get('active.client_id');
        convertToId(data);
    });

    async function accessToken(client_id) {
        console.log('Running access_token for', client_id);
        let access_token = store.get(`extensions.${client_id}.access_token`);
        console.log('Loaded existing token', access_token);
        // validate existing token
        if (access_token) {
            let validate_url = new URL('https://id.twitch.tv/oauth2/validate');
            try {
                let validate_req = await fetch(
                    validate_url, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${access_token}`
                        }
                    }
                );
                //let validate_resp = await validate_url.json();
                console.log(`Validated: ${validate_req.status}`);

                if (validate_req.status != 200) {
                    // yay
                    console.log('Regenerate');
                    store.delete(`extensions.${client_id}.access_token`);
                    access_token = '';
                }
            } catch (err) {
                console.error('validate error', err);
                // remove
                store.delete(`extensions.${client_id}.access_token`);
                // wipe
                access_token = '';
            }
        }

        if (!access_token) {
            let client_secret = store.get(`extensions.${client_id}.client_secret`);
            if (!client_secret) {
                win.webContents.send('errorMsg', `No Client Secret for ${client_id}`);
                return;
            }

            // token time
            let token_url = new URL('https://id.twitch.tv/oauth2/token');
            let token_params = [
                [ 'client_id', client_id ],
                [ 'client_secret', client_secret ],
                [ 'grant_type', 'client_credentials' ]
            ]
            token_url.search = new URLSearchParams(token_params).toString();

            let token_req = await fetch(
                token_url, {
                    method: 'POST'
                }
            );
            let token_resp = await token_req.json();
            if (!token_resp.access_token) {
                console.log(token_resp);
                win.webContents.send('errorMsg', 'Failed to get an Access Token');
                return;
            }

            console.log('Generated a token', token_resp.access_token);
            // store in persistent
            store.set(`extensions.${client_id}.access_token`, token_resp.access_token);
        }

        return;
    }

    async function convertToId(data) {
        let { client_id, login, el } = data;

        if (!login || login == '') {
            win.webContents.send('errorMsg', 'Username is required to convert to a UserID');
            return;
        }

        try {
            await accessToken(client_id);

            let access_token = store.get(`extensions.${client_id}.access_token`);

            // username to ID time
            let users_url = new URL('https://api.twitch.tv/helix/users');
            let users_params = [
                [ 'login', login ]
            ]
            users_url.search = new URLSearchParams(users_params).toString();

            let users_req = await fetch(
                users_url,
                {
                    method: 'GET',
                    headers: {
                        'Client-ID': client_id,
                        'Authorization': `Bearer ${access_token}`
                    }
                }
            );
            let users_resp = await users_req.json();

            console.log(users_resp);

            if (users_resp.data && users_resp.data.length == 1) {
                console.log('send back', users_resp.data[0].id);
                win.webContents.send('convertedToId', {
                    el,
                    id: users_resp.data[0].id
                });
                return;
            }
            win.webContents.send('errorMsg', 'User not found');
        } catch (err) {
            console.error(err);
        }
    }

    /*
    Bits products
    */
    async function getProducts(should_include_all, ret) {
        let client_id = store.get('active.client_id');

        await accessToken(client_id);

        let access_token = store.get(`extensions.${client_id}.access_token`);

        let products_url = new URL('https://api.twitch.tv/helix/bits/extensions');
        let products_params = [
            [ 'should_include_all', should_include_all ]
        ]
        products_url.search = new URLSearchParams(products_params).toString();

        let products_req = await fetch(
            products_url,
            {
                method: 'GET',
                headers: {
                    'Client-ID': client_id,
                    'Authorization': `Bearer ${access_token}`
                }
            }
        );
        let products_resp = await products_req.json();

        if (ret) {
            return products_resp.data;
        }

        console.log(products_resp);
        if (products_resp.data) {
            console.log('send back', products_resp.data.length);

            win.webContents.send('bits.gotProducts', products_resp.data);

            win.webContents.send('extensionAPIResult', {
                status: products_req.status,
                ratelimitRemain: products_req.headers.get('ratelimit-remaining'),
                ratelimitLimit: products_req.headers.get('ratelimit-limit')
            });

            return;
        }
        win.webContents.send('errorMsg', 'Bits Products not found');
    }
    ipcMain.on('bits.getProducts', (e,should_include_all) => {
        getProducts(should_include_all);
    });


    ipcMain.on('bits.createProduct', (e,data) => {
        createProduct(data);
    });
    async function createProduct(data) {
        console.log('Attempt product create', data);
        let client_id = store.get('active.client_id');

        await accessToken(client_id);

        let access_token = store.get(`extensions.${client_id}.access_token`);

        let products_url = new URL('https://api.twitch.tv/helix/bits/extensions');

        let products_req = await fetch(
            products_url,
            {
                method: 'PUT',
                headers: {
                    'Client-ID': client_id,
                    'Authorization': `Bearer ${access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }
        );
        let products_resp = await products_req.json();

        console.log(products_resp);
        if (products_resp.data && products_resp.data.length == 1) {
            win.webContents.send('bits.createdProduct');

            win.webContents.send('extensionAPIResult', {
                status: products_req.status,
                ratelimitRemain: products_req.headers.get('ratelimit-remaining'),
                ratelimitLimit: products_req.headers.get('ratelimit-limit')
            });

            return;
        }
        win.webContents.send('errorMsg', `Bits Product errored: ${products_resp.message}`);
    }


    ipcMain.on('bits.getTransactions', (e,data) => {
        getTransactions(data);
    });
    async function getTransactions(data) {
        let client_id = store.get('active.client_id');

        await accessToken(client_id);

        let access_token = store.get(`extensions.${client_id}.access_token`);

        let transactions_url = new URL('https://api.twitch.tv/helix/extensions/transactions');
        let transactions_params = [
            [ 'extension_id', client_id ]
        ]
        transactions_url.search = new URLSearchParams(transactions_params).toString();

        let transactions_req = await fetch(
            transactions_url,
            {
                method: 'GET',
                headers: {
                    'Client-ID': client_id,
                    'Authorization': `Bearer ${access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }
        );
        let transactions_resp = await transactions_req.json();

    }

    return;
}

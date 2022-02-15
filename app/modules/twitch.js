const { access } = require('original-fs');

module.exports = function(lib) {
    let { ipcMain, win, store } = lib;

    const fetch = require('electron-fetch').default;

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
        if (!login || login == '') {
            win.webContents.send('errorMsg', 'Username is required to convert to a UserID');
            return;
        }

        try {
            let access_token = store.get(`extensions.${client_id}.access_token`);
            console.log('Loaded', access_token);
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
                access_token = token_resp.access_token;
            }

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
                win.webContents.send('ownerConvertedToId', users_resp.data[0].id);
                return;
            }
            win.webContents.send('errorMsg', 'User not found');
        } catch (err) {
            console.error(err);
        }
    });

    function getToken() {
        let extensions = store.get('extensions');
        let active = store.get('active');
        if (!active) {
            return;
        }

        let config = extensions[active.client_id];
        if (!config.client_id && !config.client_secret) {
            return;
        }


        let url = new URL('https://id.twitch.tv/oauth2/token');
/*
    ?client_id=<your client ID>
    &client_secret=<your client secret>
    &grant_type=client_credentials
*/
        let params = [
            [ 'extension_id', details.extension_id ],
            [ 'segment', details.segment ]
        ];
        url.search = new URLSearchParams(params).toString();

        //fetch(
        //);
    }
    ipcMain.on('convertToId', (event, data) => {
        let { field, value } = data;
        console.log('convertToId', value, 'return', field);


    });

    return;
}

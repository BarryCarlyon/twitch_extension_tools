module.exports = function(lib) {
    let { ipcMain, win, store } = lib;

    let temporary_token_storage = {};

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
            if (!temporary_token_storage.hasOwnProperty(client_id)) {
                // token time
                let token_url = new URL('https://id.twitch.tv/oauth2/token');
                let token_params = [
                    [ 'client_id', client_id ],
                    [ 'client_secret', client_secret ],
                    [ 'grant_type', 'client_credentials' ]
                ]
                token_url.search = new URLSearchParams(token_params).toString();

                let req = await fetch(
                    token_url, {
                        method: 'POST'
                    }
                );
                let resp = await req.json();
                if (!resp.access_token) {
                    console.log(resp);
                    win.webContents.send('errorMsg', 'Failed to get an Access Token');
                    return;
                }

                console.log('Generated a token', resp.access_token);
                temporary_token_storage[client_id] = resp.access_token;
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
                        'Authorization': `Bearer ${temporary_token_storage[client_id]}`
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

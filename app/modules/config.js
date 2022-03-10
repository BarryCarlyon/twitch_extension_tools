/**
 * Houses all the functions for CRUD of configuration sets
**/
module.exports = function(lib) {
    let { ipcMain, win, store } = lib;

    const jwt = require('jsonwebtoken');
    const fetch = require('electron-fetch').default;

    let config = {
        create: (event, args) => {
            //console.log(args);
            let { client_id } = args;
            store.set(`extensions.${client_id}.name`, args.name);
            store.set(`extensions.${client_id}.client_id`, client_id);
            store.set(`extensions.${client_id}.extension_secret`, args.extension_secret);
            store.set(`extensions.${client_id}.client_secret`, args.client_secret);
            store.set(`extensions.${client_id}.user_id`, args.user_id);

            config.relay();
        },
        loadForEdit: (event, client_id) => {
            let extensions = store.get('extensions');
            extensions = extensions ? extensions : {};
            if (extensions.hasOwnProperty(client_id)) {
                win.webContents.send('extension_loadedForEdit', extensions[client_id]);
                return;
            }
            win.webContents.send('errorMsg', `Config for ${client_id} not found`);
        },
        remove: (event, client_id) => {
            let extensions = store.get('extensions');
            extensions = extensions ? extensions : {};
            delete extensions[client_id];
            store.set('extensions', extensions);

            config.relay();
        },

        ready: () => {
            config.relay();

            let active = store.get('active');
            if (active) {
                if (active.client_id && active.version) {
                    console.log('Presetup', active);
                    getExtensionDetails(active.client_id, active.version);
                }
            }
        },
        relay: () => {
            console.log('Extensions Punt');
            win.webContents.send('config_extensions', {
                extensions: store.get('extensions'),
                active_client_id: store.get('active.client_id')
            });
        },

        select: (event, client_id) => {
            //console.log('Selected', client_id);
            let extensions = store.get('extensions');
            if (extensions.hasOwnProperty(client_id)) {
                // validate the config

                //twitchRequest('extensions');
                getExtensionDetails(client_id);

                return;
            }

            errorMsg(`Did not find config for ${client_id}`);
        },

        version: (event, version) => {
            console.log('Change Version to', version);
            let active = store.get('active');
            // @Todo error catch
            console.log('active', typeof active, active);
            //store.set('active_extension', version);
            console.log('set Version', active.client_id, version);
            getExtensionDetails(active.client_id, version);
        },

        revoke: async (event, client_id) => {
            let token = store.get(`extensions.${client_id}.access_token`);
            console.log('About to revoke', client_id, token);
            if (token) {
                // to revoke a token
                // first we need to confirm the clientID for this token
                // in case operator manually put a oAuth token in
                // and the token != clientID
                let validate_url = new URL('https://id.twitch.tv/oauth2/validate');
                let validate_request = await fetch(
                    validate_url,
                    {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json'
                        }
                    }
                );
                if (validate_request.status == 200) {
                    // token OK
                    let validate_response = await validate_request.json();
                    let token_client_id = validate_response.client_id;

                    let revoke_url = new URL('https://id.twitch.tv/oauth2/revoke');
                    let revoke_params = [
                        [ 'client_id', token_client_id ],
                        [ 'token', token ]
                    ];
                    revoke_url.search = new URLSearchParams(revoke_params).toString();

                    let revoke_result = await fetch(
                        revoke_url,
                        {
                            method: 'POST'
                        }
                    );
                    // do do not care about the response really

                    win.webContents.send('errorMsg', 'Token Revoke: ' + revoke_result.status);
                } else {
                    win.webContents.send('errorMsg', 'Token Revoke: Not Valid token');
                }
            }
            store.delete(`extensions.${client_id}.access_token`);
            // broadcast extensions
            config.relay();
        }
    }

    function getExtensionDetails(client_id, version) {
        let extensions = store.get('extensions');
        let config = extensions[client_id];
        let token = sign(extensions[client_id]);
        //console.log('Sig', token);

        let url = new URL('https://api.twitch.tv/helix/extensions');
        let params = [
            [ 'extension_id', client_id ]
        ];
        if (version) {
            params.push([ 'extension_version', version ]);
        }
        url.search = new URLSearchParams(params).toString();

        console.log('Go with', url, token);

        fetch(
            url,
            {
                method: 'GET',
                headers: {
                    'Client-ID': client_id,
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            }
        )
        .then(resp => resp.json())
        .then(resp => {
            console.log('Got', resp);
            if (resp.status) {
                errorMsg(`Got Error ${resp.status} - ${resp.message}`);

                if (resp.status == 404) {
                    console.log('404 prompt version')
                    win.webContents.send('extension_request_version');
                    store.set('active', { client_id });
                }

                return;
            }

            if (resp.data && resp.data.length == 1) {
                store.set('active', {
                    client_id,
                    version: resp.data[0].version
                });
                win.webContents.send('extension_details', resp.data[0]);
                return;
            }

            errorMsg('Failed to load Extension Details');
        })
        .catch(err => {
            console.log(err);
        });
    }

    function errorMsg(msg) {
        win.webContents.send('errorMsg', msg);
    }

    ipcMain.on('config_create', config.create);
    ipcMain.on('config_loadForEdit', config.loadForEdit);
    ipcMain.on('config_remove', config.remove);
    ipcMain.on('config_select', config.select);
    ipcMain.on('config_revoke', config.revoke);
    ipcMain.on('select_version', config.version);
    ipcMain.on('ready', config.ready);

    function sign(config) {
        const sigConfigPayload = {
            "exp": Math.floor(new Date().getTime() / 1000) + 4,
            "user_id": config.user_id,
            "role": "external",
        }
        return jwt.sign(sigConfigPayload, Buffer.from(config.extension_secret, 'base64'));
    }

    return;
}

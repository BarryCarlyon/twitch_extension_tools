/**
 * Houses all the functions for JWT API Access
**/
module.exports = function(lib) {
    let { ipcMain, win, store } = lib;

    const jwt = require('jsonwebtoken');
    const fetch = require('electron-fetch').default;

    ipcMain.on('extensionAPI', (event, data) => {
        console.log('in extensionAPI', data);
        let { route, details } = data;

        switch (route) {
            case 'chat':
                sendChat(details);
                return;
            case 'getconfiguration':
                getConfiguration(details);
                return;
            case 'setconfiguration':
                setConfiguration(details);
                return;
            case 'setconfigurationreq':
                setConfigurationReq(details);
                return;
            case 'sendpubsub':
                sendPubSub(details);
                return;
        }
    });

    function sendChat(details) {
        let extensions = store.get('extensions');
        let active = store.get('active');
        let config = extensions[active.client_id];

        const sigConfigPayload = {
            "exp": Math.floor(new Date().getTime() / 1000) + 4,
            "user_id": config.user_id,
            "role": "external",
        }
        const token = jwt.sign(sigConfigPayload, Buffer.from(config.extension_secret, 'base64'));

        let url = new URL('https://api.twitch.tv/helix/extensions/chat');

        console.log('Attempting to post', details);

        fetch(
            url,
            {
                method: 'POST',
                headers: {
                    'Client-ID': config.client_id,
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(details)
            }
        )
        .then(async resp => {
            if (resp.status != 204) {
                let body = await resp.json();
                win.webContents.send('errorMsg', `HTTP ${resp.status}: ${body.message}`);
                return;
            }
            console.log(resp.status, resp.headers.get('ratelimit-remaining'), resp.headers.get('ratelimit-limit'));
            win.webContents.send('extensionAPIResult', {
                status: resp.status,
                ratelimitRemain: resp.headers.get('ratelimit-remaining'),
                ratelimitLimit: resp.headers.get('ratelimit-limit')
            });
        })
        .catch(err => {
            console.log(err);
        });
    }

    function getConfiguration(details) {
        let extensions = store.get('extensions');
        let active = store.get('active');
        let config = extensions[active.client_id];

        const sigConfigPayload = {
            "exp": Math.floor(new Date().getTime() / 1000) + 4,
            "user_id": config.user_id,
            "role": "external",
        }
        const token = jwt.sign(sigConfigPayload, Buffer.from(config.extension_secret, 'base64'));

        let url = new URL('https://api.twitch.tv/helix/extensions/configurations');
        let params = [
            [ 'extension_id', details.extension_id ],
            [ 'segment', details.segment ]
        ];
        if (details.segment != 'global') {
            params.push([ 'broadcaster_id', details.broadcaster_id ]);
        }
        url.search = new URLSearchParams(params).toString();

        console.log('Attempting to get', details, params);

        fetch(
            url,
            {
                headers: {
                    'Client-ID': config.client_id,
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        )
        .then(async resp => {
            console.log('GET', url, resp.status);

            let body = await resp.json();
            if (resp.status != 200) {
                win.webContents.send('errorMsg', `HTTP ${resp.status}: ${body.message}`);
                return;
            }

            let config = '';
            let version = '';
            if (body.data && body.data.length == 1) {
                config = body.data[0].content;
                version = body.data[0].version;
            }

            console.log(resp.status, resp.headers.get('ratelimit-remaining'), resp.headers.get('ratelimit-limit'));
            win.webContents.send('extensionAPIResult', {
                config,
                version,
                status: resp.status,
                ratelimitRemain: resp.headers.get('ratelimit-remaining'),
                ratelimitLimit: resp.headers.get('ratelimit-limit')
            });
        })
        .catch(err => {
            console.log(err);
        });
    }
    function setConfiguration(details) {
        let extensions = store.get('extensions');
        let active = store.get('active');
        let config = extensions[active.client_id];

        const sigConfigPayload = {
            "exp": Math.floor(new Date().getTime() / 1000) + 4,
            "user_id": config.user_id,
            "role": "external",
        }
        const token = jwt.sign(sigConfigPayload, Buffer.from(config.extension_secret, 'base64'));

        let url = new URL('https://api.twitch.tv/helix/extensions/configurations');

        if (details.segment == 'global') {
            delete details.broadcaster_id;
        }

        console.log('setConfiguration Putting', details);

        fetch(
            url,
            {
                method: 'PUT',
                headers: {
                    'Client-ID': config.client_id,
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(details)
            }
        )
        .then(async resp => {
            console.log('PUT', url, resp.status);
            if (resp.status == 204) {
                console.log('ok', resp.status, resp.headers.get('ratelimit-remaining'), resp.headers.get('ratelimit-limit'));
                // yay
                win.webContents.send('extensionAPIResult', {
                    status: resp.status,
                    ratelimitRemain: resp.headers.get('ratelimit-remaining'),
                    ratelimitLimit: resp.headers.get('ratelimit-limit')
                });

                return;
            }

            let body = await resp.json();
            win.webContents.send('errorMsg', `HTTP ${resp.status}: ${body.message}`);
            console.log('fail', resp.status, resp.headers.get('ratelimit-remaining'), resp.headers.get('ratelimit-limit'));
        })
        .catch(err => {
            console.log(err);
        });
    }

    function setConfigurationReq(details) {
        let extensions = store.get('extensions');
        let active = store.get('active');
        let config = extensions[active.client_id];

        const sigConfigPayload = {
            "exp": Math.floor(new Date().getTime() / 1000) + 4,
            "user_id": config.user_id,
            "role": "external",
        }
        const token = jwt.sign(sigConfigPayload, Buffer.from(config.extension_secret, 'base64'));

        let url = new URL('https://api.twitch.tv/helix/extensions/required_configuration');

        console.log('setConfigurationReq Putting', details);

        fetch(
            url,
            {
                method: 'PUT',
                headers: {
                    'Client-ID': config.client_id,
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(details)
            }
        )
        .then(async resp => {
            console.log('PUT', url, resp.status);

            if (resp.status == 204) {
                console.log('OK', resp.status, resp.headers.get('ratelimit-remaining'), resp.headers.get('ratelimit-limit'));
                win.webContents.send('extensionAPIResult', {
                    status: resp.status,
                    ratelimitRemain: resp.headers.get('ratelimit-remaining'),
                    ratelimitLimit: resp.headers.get('ratelimit-limit')
                });

                return;
            }

            let body = await resp.json();
            console.log('Fail', resp.status, body);
            win.webContents.send('errorMsg', `HTTP ${resp.status}: ${body.message}`);
        })
        .catch(err => {
            console.log(err);
        });
    }

    function sendPubSub(details) {
        let extensions = store.get('extensions');
        let active = store.get('active');
        let config = extensions[active.client_id];

        const sigConfigPayload = {
            "exp":          Math.floor(new Date().getTime() / 1000) + 4,
            "user_id":      config.user_id,
            "role":         "external",
            "channel_id":   "all",
            "pubsub_perms": {
                "send": []
            }
        }

        switch (details.target[0]) {
            case 'global':
                sigConfigPayload.pubsub_perms.send.push('global');
                delete details.broadcaster_id;
                break;
            case 'broadcast':
                sigConfigPayload.channel_id = details.broadcaster_id;
                sigConfigPayload.pubsub_perms.send.push('broadcast');
                break;
            case 'whisper':
                details.target[0] = `whisper-${details.target_whisper}`
                sigConfigPayload.channel_id = details.broadcaster_id;
                sigConfigPayload.pubsub_perms.send.push(`whisper-${details.target_whisper}`);
                break;
        }

        delete details.target_whisper;

        console.log('Sig', sigConfigPayload);
        const token = jwt.sign(sigConfigPayload, Buffer.from(config.extension_secret, 'base64'));

        let url = new URL('https://api.twitch.tv/helix/extensions/pubsub');

        console.log('sendPubSub POSTing', details);

        fetch(
            url,
            {
                method: 'POST',
                headers: {
                    'Client-ID': config.client_id,
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(details)
            }
        )
        .then(async resp => {
            console.log('POST', url, resp.status);

            if (resp.status == 204) {
                console.log('OK', resp.status, resp.headers.get('ratelimit-remaining'), resp.headers.get('ratelimit-limit'));
                win.webContents.send('extensionAPIResult', {
                    status: resp.status,
                    ratelimitRemain: resp.headers.get('ratelimit-remaining'),
                    ratelimitLimit: resp.headers.get('ratelimit-limit')
                });

                return;
            }

            let body = await resp.json();
            console.log('Fail', resp.status, body);
            win.webContents.send('errorMsg', `HTTP ${resp.status}: ${body.message}`);
        })
        .catch(err => {
            console.log(err);
        });
    }

    return;
}

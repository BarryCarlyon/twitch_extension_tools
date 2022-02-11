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
            console.log(resp.status, resp.headers['ratelimit-remaining'], resp.headers['ratelimit-limit']);
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

    return;
}

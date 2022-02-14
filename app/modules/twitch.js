module.exports = function(lib) {
    let { ipcMain, win, store } = lib;

    const fetch = require('electron-fetch').default;

    function getToken() {
        let extensions = store.get('extensions');
        let active = store.get('active');
        if (!active) {
            return;
        }

        let config = extensions[active.client_id];
        if (config.client_id && config.client_secret) {

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

        fetch(
        );
    }

    return;
}

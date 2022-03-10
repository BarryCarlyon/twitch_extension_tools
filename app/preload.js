const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    ready: () => {
        console.log('Relay ready');
        ipcRenderer.send('ready');
    },

    onUpdater: (fn) => {
        ipcRenderer.on('updater', (event, ...args) => fn(...args));
    },
    updateCheck: () => {
        ipcRenderer.send('updateCheck');
    },

    config: {
        create: (extension) => {
            ipcRenderer.send('config_create', extension);
        },
        loadForEdit: (client_id) => {
            ipcRenderer.send('config_loadForEdit', client_id);
        },
        loadedForEdit: (fn) => {
            ipcRenderer.on('extension_loadedForEdit', (event, ...args) => fn(...args));
        },
        remove: (client_id) => {
            ipcRenderer.send('config_remove', client_id);
        },
        extensions: (fn) => {
            ipcRenderer.on('config_extensions', (event, ...args) => fn(...args));
        },
        select: (client_id) => {
            ipcRenderer.send('config_select', client_id);
        },

        requestVersion: (fn) => {
            ipcRenderer.on('extension_request_version', (event, ...args) => fn(...args));
        },
        selectVersion: (version) => {
            ipcRenderer.send('select_version', version);
        },
        extensionDetails: (fn) => {
            ipcRenderer.on('extension_details', (event, ...args) => fn(...args));
        },
        revokeToken: (client_id) => {
            ipcRenderer.send('config_revoke', client_id);
        }
    },

    ownerConvertToId: (client_id, client_secret, login) => {
        ipcRenderer.send('ownerConvertToId', { client_id, client_secret, login });
    },
    convertToId: (el, login) => {
        ipcRenderer.send('convertToId', { el, login });
    },
        convertedToId: (fn) => {
            ipcRenderer.on('convertedToId', (event, ...args) => fn(...args));
        },

    extensionAPI: (route, details) => {
        ipcRenderer.send('extensionAPI', {
            route,
            details
        });
    },
    extensionAPIResult: (fn) =>{
        ipcRenderer.on('extensionAPIResult', (event, ...args) => fn(...args));
    },
    bits: {
        getProducts: (should_include_all) => {
            ipcRenderer.send('bits.getProducts', should_include_all);
        },
        gotProducts: (fn) =>{
            ipcRenderer.on('bits.gotProducts', (event, ...args) => fn(...args));
        },

        createProduct: (data) => {
            ipcRenderer.send('bits.createProduct', data);
        },
        createdProduct: (fn) =>{
            ipcRenderer.on('bits.createdProduct', (event, ...args) => fn(...args));
        }
    },

    errorMsg: (fn) => {
        ipcRenderer.on('errorMsg', (event, ...args) => fn(...args));
    },

    openWeb: (url) => {
        ipcRenderer.send('openWeb', url);
    }
});

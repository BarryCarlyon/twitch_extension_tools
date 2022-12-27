/**
 * Houses all the functions for electron updated information relay and trigger
**/
const { autoUpdater } = require("electron-updater");

module.exports = function(lib) {
    let { ipcMain, win, app } = lib;

    let ready_to_restart = false;

    function doUpdateCheck() {
        if (!app.isPackaged || process.mas) {
            // it is mac app store
            win.webContents.send('updater', {
                event: 'noupdater',
            });
            return;
        }

        console.log('Update Check', ready_to_restart);
        if (ready_to_restart) {
            autoUpdater.quitAndInstall();
            return;
        }
        autoUpdater.checkForUpdatesAndNotify();
    }
    ipcMain.on('updateCheck', doUpdateCheck);
    ipcMain.on('ready', doUpdateCheck);

    autoUpdater.on('error', (e) => {
        //console.log('error', e);
        win.webContents.send('updater', {
            event: 'update-error',
        });
    }).on('checking-for-update', (e) => {
        //console.log('checking-for-update', e);
        win.webContents.send('updater', {
            event: 'checking-for-update',
        });
    }).on('update-available', (e) => {
        //console.log('update-available', e);
        win.webContents.send('updater', {
            event: 'update-available',
        });
    }).on('update-not-available', (e) => {
        //console.log('update-not-available', e);
        win.webContents.send('updater', {
            event: 'update-not-available',
        });
    }).on('download-progress', (data) => {
        //console.log('download-progress', data);
        win.webContents.send('updater', {
            event: 'download-progress',
            data
        });
    }).on('update-downloaded', (e) => {
        //console.log('update-downloaded', e);
        win.webContents.send('updater', {
            event: 'update-downloaded',
        });
        ready_to_restart = true;

        //setTimeout(function() {
        //    autoUpdater.quitAndInstall();
        //}, 1000);
    });

    return;
}

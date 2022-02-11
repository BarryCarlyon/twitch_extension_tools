const { autoUpdater } = require("electron-updater");

module.exports = function(lib) {
    let { ipcMain, win } = lib;

    function doUpdateCheck() {
        console.log('Update Check');
        autoUpdater.on('error', (e) => {
            console.log('error', e);
            win.webContents.send('updater', {
                event: 'update-error',
            });
        }).on('checking-for-update', (e) => {
            console.log('checking-for-update', e);
            win.webContents.send('updater', {
                event: 'checking-for-update',
            });
        }).on('update-available', (e) => {
            console.log('update-available', e);
            win.webContents.send('updater', {
                event: 'update-available',
            });
        }).on('update-not-available', (e) => {
            console.log('update-not-available', e);
            win.webContents.send('updater', {
                event: 'update-not-available',
            });
        }).on('download-progress', (data) => {
            console.log(data);
            win.webContents.send('updater', {
                event: 'download-progress',
                data
            });
        }).on('update-downloaded', (e) => {
            console.log('update-downloaded', e);
            win.webContents.send('updater', {
                event: 'update-downloaded',
            });

            setTimeout(function() {
                autoUpdater.quitAndInstall();
            }, 1000);
        });

        autoUpdater.checkForUpdatesAndNotify();
    }
    ipcMain.on('updateCheck', doUpdateCheck);
    ipcMain.on('ready', doUpdateCheck);

    return;
}

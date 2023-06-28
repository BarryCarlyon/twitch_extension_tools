const { app, BrowserWindow, ipcMain, shell, session } = require('electron');
const os = require('os');

const path = require('path');

const Store = require('electron-store');
const store = new Store();

const contextMenu = require('electron-context-menu');
contextMenu();

app.on('window-all-closed', () => {
    app.quit()
});

/*
not needed/doesn't work for MAS and not needed for mac.
Mac self enforces
and MAS has a fun permissions issue
*/
if (os.platform() == 'win32') {
    const gotLock = app.requestSingleInstanceLock();
    if (!gotLock) {
        app.quit();
    } else {
        app.on('second-instance', (event, commandLine, workingDirectory) => {
            // Someone tried to run a second instance, we should focus our window.
            if (win) {
                if (win.isMinimized()) {
                    win.restore();
                }
                win.focus();
            }
        });
    }
}

app.on('ready', () => {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': ['script-src \'self\'']
            }
        })
    });

    // settings migration
    let options = {
        width: 1000,
        height: 800,
        x: 0,
        y: 0,

        show: false,

        title: `BarryCarlyon Twitch Extension Tools: v${app.getVersion()}`,
        autoHideMenuBar: false,
        backgroundColor: '#000000',

        maximizable: true,
        resizable: true,
        frame: true,

        webPreferences: {
            preload: path.join(app.getAppPath(), 'app', 'preload.js')
        }
    }

    let position = store.get('window.position');
    if (position) {
        delete options.center;
        // validate position
        options.x = position[0];
        options.y = position[1];
    }
    let size = store.get('window.size');
    if (size) {
        options.width = size[0];
        options.height = size[1];
    }

    win = new BrowserWindow(options);
    win.removeMenu();

    // on a display check
    let on_a_display = false;
    let displays = require('electron').screen.getAllDisplays();
    displays.map(function(display) {
        if (
            win.getPosition()[0] >= display.bounds.x
            &&
            win.getPosition()[1] >= display.bounds.y
            &&
            win.getPosition()[0] < (display.bounds.x + display.bounds.width)
            &&
            win.getPosition()[1] < (display.bounds.y + display.bounds.height)
        ) {
            on_a_display = true;
        }
    });
    if (!on_a_display) {
        // reset to center
        win.center();
        store.delete('window.position');
    }
    win.on('moved', (e) => {
        store.set('window.position', win.getPosition());
    });
    win.on('resized', (e) => {
        store.set('window.size', win.getSize());
    });

    win.loadFile(path.join(app.getAppPath(), 'app', 'views', 'interface.html'));
    win.once('ready-to-show', () => {
        win.show();
        win.setTitle(`BarryCarlyon Twitch Extension Tools: v${app.getVersion()}`);
    });
    if (!app.isPackaged) {
        setTimeout(() => {
            win.webContents.openDevTools();
        }, 1500);
    }

    ipcMain.on('openWeb', (e,url) => {
        shell.openExternal(url);
    });
    ipcMain.on('minimize', () => {
        win.minimize();
    });
    ipcMain.on('quit', () => {
        app.quit();
    });

    // add updater
    require(path.join(app.getAppPath(), 'app', 'modules', 'updater.js'))({ app, ipcMain, win, store });
    // handler
    require(path.join(app.getAppPath(), 'app', 'modules', 'config.js'))({ app, ipcMain, win, store });
    require(path.join(app.getAppPath(), 'app', 'modules', 'extensions.js'))({ app, ipcMain, win, store });
    require(path.join(app.getAppPath(), 'app', 'modules', 'twitch.js'))({ app, ipcMain, win, store });
});

let win;

const { app, BrowserWindow, ipcMain, shell } = require('electron');

const path = require('path');

const Store = require('electron-store');
const store = new Store();

const contextMenu = require('electron-context-menu');
contextMenu();

app.on('window-all-closed', () => {
    app.quit()
});

app.on('ready', () => {
    // settings migration
    let options = {
        width: 1000,
        height: 600,
        x: 0,
        y: 0,

        show: false,

        title: 'BarryCarlyon Twitch Extension Tools',
        autoHideMenuBar: false,
        backgroundColor: '#000000',

        maximizable: true,
        resizable: true,
        frame: true,

        webPreferences: {
            preload: path.join(app.getAppPath(), '/preload.js')
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

    win.loadFile('views/interface.html');
    win.once('ready-to-show', () => {
        win.show();
        win.setTitle('BarryCarlyon Twitch Extension Tools: ' + app.getVersion());
    });
    //win.webContents.openDevTools();

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
    require(path.join(__dirname, 'modules', 'updater.js'))({ app, ipcMain, win, store });
    // handler
    require(path.join(__dirname, 'modules', 'config.js'))({ app, ipcMain, win, store });
    require(path.join(__dirname, 'modules', 'extensions.js'))({ app, ipcMain, win, store });
    require(path.join(__dirname, 'modules', 'twitch.js'))({ app, ipcMain, win, store });
});

let win;

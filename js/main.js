const {app, Menu, Tray, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const url = require('url')

var background;
var preferences;

let tray = null

app.dock.hide()
app.on('ready', () => {
  createBackground();
  tray = new Tray(path.normalize(path.join(__dirname, '../umbrellaTemplate.png')))
  const contextMenu = Menu.buildFromTemplate([
    {
      role: 'about',
    },
    {
      type: 'separator'
    },
    {
      label: 'Preferences',
      accelerator: 'CmdOrCtrl+,',
      click: openPreferences
    },
    {
      type: 'separator'
    },
    {
      role: 'quit',
      accelerator: 'Cmd+Q'
    }
  ])
  tray.setContextMenu(contextMenu)
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    {
      label: app.getName(),
      submenu: [
        {role: 'about'},
        {type: 'separator'},
        {type: 'separator'},
        {role: 'hide'},
        {role: 'hideothers'},
        {role: 'unhide'},
        {type: 'separator'},
        {role: 'quit'}
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'pasteandmatchstyle' },
        { role: 'delete' },
        { role: 'selectall' }
      ]
    }
  ]));
})

function createBackground() {
  background = new BrowserWindow({width: 800, height: 600, show: false})
  background.loadURL(url.format({
    pathname: path.normalize(path.join(__dirname, '../html/index.html')),
    protocol: 'file:',
    slashes: true
  }))
  background.webContents.openDevTools();
}


function openPreferences() {
  if (!preferences) {
    app.dock.show()
    preferences = new BrowserWindow({show: false, width: 230, height: 210, resizable: false})
    preferences.loadURL(url.format({
      pathname: path.normalize(path.join(__dirname, '../html/preferences.html')),
      protocol: 'file:',
      slashes: true
    }))
    preferences.once('ready-to-show', () => {
      preferences.show()
      //preferences.webContents.openDevTools()
    })
    preferences.on('closed', () =>{
      preferences = null;
      app.dock.hide()
    })
  }
  else preferences.focus()
}

ipcMain.on('preferences', (event, arg) => {
  console.log("Update Renderer...")
  background.webContents.send('update');
});

function quit() {
  app.quit();
}
const { app, BrowserWindow } = require("electron");

let mainWindow = null;

app.on('ready', () => {
    console.log("Hello world");
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        center: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            nodeIntegrationInWorker: true
        }
    });
    mainWindow.webContents.loadFile('./app/index.html');
    mainWindow.webContents.openDevTools();
});
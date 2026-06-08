const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const { readFileSync, readdirSync } = require('fs')
const { join, extname } = require('path')




const createWindow = () => {
  const mainWindow = new BrowserWindow({
    show: false,
    transparent: true,
    frame: false,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      webSecurity: false
    },
  })
  mainWindow.maximize()
  mainWindow.show()
  mainWindow.loadFile('index.html')
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

ipcMain.handle('pick-folder', async () => {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] })
  if (result.canceled) return null
  return result.filePaths[0]
})

ipcMain.handle('get-images', async (event, folderPath) => {
  const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  const files = readdirSync(folderPath)
  return files
    .filter(f => extensions.includes(extname(f).toLowerCase()))
    .map(f => {
      const filePath = join(folderPath, f)
      const data = readFileSync(filePath)
      const ext = extname(f).slice(1)
      return `data:image/${ext};base64,${data.toString('base64')}`
    })
})

ipcMain.handle('minimize', () => {
  BrowserWindow.getFocusedWindow()?.minimize()
})

ipcMain.handle('close', () => {
  BrowserWindow.getFocusedWindow()?.close()
})
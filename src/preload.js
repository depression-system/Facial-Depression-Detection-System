const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    saveBuffer: (buffer) => ipcRenderer.invoke("save-buffer", buffer),
    startAnalysis: (filePath) => ipcRenderer.invoke("start-analysis", filePath),
});
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Example: Send a message to the main process
  sendMessage: (message) => ipcRenderer.send('message', message),
  
  // Example: Receive a message from the main process
  onMessage: (callback) => ipcRenderer.on('message', callback),
  
  // Example: Get app version
  getVersion: () => ipcRenderer.invoke('get-version'),
  
  // Example: Open file dialog
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  
  // Example: Save file dialog
  saveFile: (data) => ipcRenderer.invoke('dialog:saveFile', data),
  
  // API communication functions
  apiRequest: (endpoint, options = {}) => ipcRenderer.invoke('api:request', endpoint, options),
  
  // Data operations
  getData: () => ipcRenderer.invoke('api:getData'),
  createData: (data) => ipcRenderer.invoke('api:createData', data),
  updateData: (id, data) => ipcRenderer.invoke('api:updateData', id, data),
  deleteData: (id) => ipcRenderer.invoke('api:deleteData', id),
  uploadCSV: (filePath) => ipcRenderer.invoke('api:uploadCSV', filePath),
  exportCSV: () => ipcRenderer.invoke('api:exportCSV'),
  getAnalytics: () => ipcRenderer.invoke('api:getAnalytics'),
  
  // Remove all listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
}); 
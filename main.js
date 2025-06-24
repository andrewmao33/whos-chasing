const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const https = require('https');
const http = require('http');
const fs = require('fs');

// Keep a global reference of the window object
let mainWindow;

// API base URL
const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.png'), // Optional: add an icon
    title: 'Who\'s Chasing'
  });

  // Load the React app
  // In development, this will be the React dev server
  // In production, this will be the built React app
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    // Load from React dev server
    mainWindow.loadURL('http://localhost:3000');
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    // Load the built React app
    mainWindow.loadFile(path.join(__dirname, 'frontend/build/index.html'));
  }

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          resolve(data);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

// API handlers
ipcMain.handle('api:request', async (event, endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    return await makeRequest(url, options);
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
});

ipcMain.handle('api:getData', async () => {
  return await makeRequest(`${API_BASE_URL}/data/`);
});

ipcMain.handle('api:createData', async (event, data) => {
  return await makeRequest(`${API_BASE_URL}/data/`, {
    method: 'POST',
    body: data
  });
});

ipcMain.handle('api:updateData', async (event, id, data) => {
  return await makeRequest(`${API_BASE_URL}/data/${id}`, {
    method: 'PUT',
    body: data
  });
});

ipcMain.handle('api:deleteData', async (event, id) => {
  return await makeRequest(`${API_BASE_URL}/data/${id}`, {
    method: 'DELETE'
  });
});

ipcMain.handle('api:uploadCSV', async (event, filePath) => {
  try {
    const formData = new FormData();
    const fileStream = fs.createReadStream(filePath);
    formData.append('file', fileStream);
    
    // This would need a more complex implementation for file upload
    // For now, we'll use a simple approach
    const fileContent = fs.readFileSync(filePath);
    const base64Content = fileContent.toString('base64');
    
    return await makeRequest(`${API_BASE_URL}/data/upload-csv/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      body: { file: base64Content }
    });
  } catch (error) {
    console.error('CSV upload error:', error);
    throw error;
  }
});

ipcMain.handle('api:exportCSV', async () => {
  return await makeRequest(`${API_BASE_URL}/data/export-csv/`);
});

ipcMain.handle('api:getAnalytics', async () => {
  return await makeRequest(`${API_BASE_URL}/data/analytics/`);
});

// This method will be called when Electron has finished initialization
app.whenReady().then(createWindow);

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
  });
}); 
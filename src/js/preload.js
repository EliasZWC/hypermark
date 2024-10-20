const { contextBridge, ipcRenderer } = require('electron');

// 窗口控制
contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => {
    ipcRenderer.send('minimize-window');
  },
  closeWindow: () => {
    ipcRenderer.send('close-window');
  },
  toggleMaximizeWindow: () => {
    ipcRenderer.send('toggle-maximize-window');
  }
});

// 文件选择
contextBridge.exposeInMainWorld('electron', {
  // 01 选择文件和文件夹
  selectFile: async () => {
    return await ipcRenderer.invoke('dialog:openFile');
  },
  selectFolder: async () => {
    return await ipcRenderer.invoke('dialog:openDirectory');
  },
  // 02 读写数据
  readData: (data) => ipcRenderer.invoke('read-data', data),
  saveData: (data) => ipcRenderer.invoke('save-data', data),
  deleteData: (title) => ipcRenderer.invoke('delete-data', title),
  // 03 转换文件
  convertMarkdown: (convertData) => {
    ipcRenderer.send('convert-markdown', convertData);
  },
  onConvertResult: (callback) => {
    ipcRenderer.on('convert-result', (event, result) => {
      callback(result);
    });
  },
  openExternal: (url) => ipcRenderer.send('open-external', url),
});
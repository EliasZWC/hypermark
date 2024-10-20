// 导入模块
const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron')
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path')

// 封装函数
// 01 创建窗口
function createWindow () {
  // 创建浏览窗口
  const mainWindow = new BrowserWindow({
    show: false, // 窗体
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 600,
    frame: false, // 标题栏
    autoHideMenuBar: true, // 隐藏菜单栏
    icon: "./src/assets/images/logo.png",
    title: "HyperMark",
    webPreferences: {
      preload: path.join(__dirname, 'src/js/preload.js'),
      nodeIntegration: false,
    }
  })

  // 载入索引HTML文档
  mainWindow.loadFile('src/index.html')
  // 监听窗体加载完毕后显示窗体
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// 启动应用后执行的操作
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 窗口控制
ipcMain.on('minimize-window', () => {
  const windows = BrowserWindow.getAllWindows();
  if (windows.length > 0) {
    const mainWindow = windows[0];
    mainWindow.minimize();
  }
});
ipcMain.on('close-window', () => {
  const windows = BrowserWindow.getAllWindows();
  if (windows.length > 0) {
    const mainWindow = windows[0];
    mainWindow.close();
  }
});
ipcMain.on('toggle-maximize-window', () => {
  const windows = BrowserWindow.getAllWindows();
  if (windows.length > 0) {
    const mainWindow = windows[0];
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

// 文件选择
ipcMain.handle('dialog:openFile', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile']
  });
  return result.filePaths[0] || ''; // 返回第一个文件的路径
});
ipcMain.handle('dialog:openDirectory', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  return result.filePaths[0] || ''; // 返回选择的文件夹路径
});


// 模板读写
ipcMain.handle('read-data', (event) => {
  const filePath = path.join(__dirname, 'templates.json');
  if (fs.existsSync(filePath)) {
    const fileData = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileData);
} else {
    return [];
}
});
ipcMain.handle('save-data', (event, data) => {
  const filePath = path.join(__dirname, 'templates.json');

  // 读取已有数据
  let existingData = [];
  if (fs.existsSync(filePath)) {
      existingData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  existingData.push(data);// 追加新数据

  fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));// 写回文件
  return true;
});
ipcMain.handle('delete-data', async (event, title) => {
  const filePath = path.join(__dirname, 'templates.json');

  if (!fs.existsSync(filePath)) {
      return false; // 如果文件不存在，返回删除失败
  }

  try {
      // 读取已有数据
      let existingData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      // 过滤掉要删除的数据项
      existingData = existingData.filter(item => item.title !== title);

      // 写回文件
      fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));

      return true; // 返回成功标识，渲染进程可以捕获这个返回值
  } catch (error) {
      console.error('Error deleting data:', error); // 记录错误信息
      throw error; // 抛出错误，以便渲染进程可以捕获
  }
});

// 转换文件
ipcMain.on('convert-markdown', (event, convertData) => {
  // 设置环境变量
  process.env.TEMPLATE_PATH = convertData.htmlPath;
  process.env.MARKDOWN_PATH = convertData.mdPath;
  process.env.STORAGE_PATH = convertData.storagePath;

  // 启动 Python 脚本
  const pythonScriptPath = './src/scripts/convert.py'; // 替换为你的 Python 脚本路径
  exec(`python ${pythonScriptPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`执行 Python 脚本时出错: ${error.message}`);
      event.reply('convert-result', { success: false, message: error.message });
      return;
    }
    if (stderr) {
      console.error(`Python 脚本输出错误: ${stderr}`);
      event.reply('convert-result', { success: false, message: stderr });
      return;
    }
    console.log(`Python 脚本输出: ${stdout}`);
    event.reply('convert-result', { success: true, output: stdout });
  });
});

// 打开外部网站
ipcMain.on('open-external', (event, url) => {
  shell.openExternal(url); // 在默认浏览器中打开链接
});
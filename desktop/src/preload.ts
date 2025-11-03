const { contextBridge } = require('electron');

// 为本地化应用暴露必要的API
contextBridge.exposeInMainWorld('electronAPI', {
  // 可以在这里添加其他需要的API，比如文件操作、系统信息等
  platform: process.platform,
  version: process.versions.electron
});
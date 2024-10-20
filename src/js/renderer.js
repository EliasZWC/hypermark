// ************************************************************************************************
// 0-1 窗口控制
// ------------------------------------------------------------------------------------------------
document.getElementById('minimize').addEventListener('click', () => {
    window.electronAPI.minimizeWindow();
});
document.getElementById('close').addEventListener('click', () => {
    window.electronAPI.closeWindow();
});
document.getElementById('maximize').addEventListener('click', () => {
    window.electronAPI.toggleMaximizeWindow();
});

// ************************************************************************************************
// 0-2 外部链接
// ------------------------------------------------------------------------------------------------
document.querySelectorAll('.link').forEach(link => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const url = event.target.href;
    window.electron.openExternal(url);
  });
});
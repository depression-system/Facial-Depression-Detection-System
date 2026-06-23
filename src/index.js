const {app, BrowserWindow, Menu, ipcMain} = require('electron');
const path = require('node:path');
const started = require('electron-squirrel-startup');
const {exec, spawn} = require("node:child_process");
const fs = require("fs");

if (started) {
    app.quit();
}

const createWindow = () => {
    Menu.setApplicationMenu(null)
    const mainWindow = new BrowserWindow({
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), nodeIntegration: true
        }, show: false,
    });
    mainWindow.maximize();
    mainWindow.show();
    mainWindow.loadURL('http://localhost:6888');
    // mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    mainWindow.webContents.openDevTools();
};


app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// 保存视频
ipcMain.handle("save-buffer", async (event, arrayBuffer) => {
    try {
        const buffer = Buffer.from(arrayBuffer);
        const saveDir = path.join(__dirname, 'videos');
        // 确保目录存在
        if (!fs.existsSync(saveDir)) {
            fs.mkdirSync(saveDir, {recursive: true}); // 递归创建目录
        }
        const savePath = path.join(saveDir, `recorded-video-${Date.now()}.webm`);
        fs.writeFileSync(savePath, buffer); // 保存文件
        return savePath;
    } catch (error) {
        throw new Error(`保存视频失败: ${error.message}`);
    }
});

// 调用Python
ipcMain.handle('start-analysis', async (event, filePath) => {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', [path.join(__dirname, '/python/main.py')]);

        // 传递数据给 Python 脚本
        pythonProcess.stdin.write(JSON.stringify({filePath: filePath}));
        pythonProcess.stdin.end();

        // 接收 Python 脚本的输出
        let output = '';
        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Python 错误: ${data}`);
            reject(data.toString());
        });

        pythonProcess.on('close', (code) => {
            if (code === 0) {
                resolve(JSON.parse(output)); // 解析 Python 返回的 JSON
            } else {
                reject(`Python 进程退出，错误代码: ${code}`);
            }
        });
    });
});


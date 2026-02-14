/**
 * CloudMate - An elegant LAN file sharing application
 * CloudMate - 一个优雅的局域网文件共享应用
 * 
 * @author Xpalnetic
 * @version 1.0.0
 * @license MIT
 * 
 * English Description:
 * CloudMate is a simple and elegant LAN file sharing application built with Node.js and Express. 
 * It allows users to easily share files within the same local network without the need for complex configurations or third-party services.
 * 
 * 中文描述：
 * CloudMate 是一个基于 Node.js 和 Express 构建的简单优雅的局域网文件共享应用。 
 * 它允许用户在同一局域网内轻松共享文件，无需复杂配置或第三方服务。
 * 
 * Features:
 * - File upload, download, and deletion
 * - Group files by device
 * - File preview and QR code sharing
 * - Cross-platform and zero-dependency frontend
 * 
 * 功能说明：
 * - 支持文件上传、下载、删除
 * - 支持按设备分组显示文件
 * - 支持文件预览、二维码分享
 * - 跨平台、零依赖前端
 * 
 * Start Guide:
 * 1. Start the server: npm start
 * 2. Access the application: http://localhost:3000 or http://<your-local-ip>:3000
 * 
 * 使用指南：
 * 启动服务: npm start
 * 访问地址: http://localhost:3000 或 http://<你的本地IP>:3000
 */

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
const PORT = 3000;
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const METADATA_FILE = path.join(UPLOAD_DIR, '.metadata.json');

// 确保上传目录存在
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// 初始化metadata文件
function initMetadata() {
  if (!fs.existsSync(METADATA_FILE)) {
    fs.writeFileSync(METADATA_FILE, JSON.stringify({}, null, 2));
  }
}

// 读取metadata
function readMetadata() {
  try {
    if (fs.existsSync(METADATA_FILE)) {
      const data = fs.readFileSync(METADATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('读取metadata失败:', error);
  }
  return {};
}

// 保存metadata
function saveMetadata(metadata) {
  try {
    fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2));
  } catch (error) {
    console.error('保存metadata失败:', error);
  }
}

initMetadata();

// 配置multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // 保留原始文件名
    cb(null, Buffer.from(file.originalname, 'latin1').toString('utf8'));
  }
});

const upload = multer({ storage });

// 中间件
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// 获取本地IP地址
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // 跳过内部和非IPv4地址
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// 获取客户端设备标识
function getClientDeviceInfo(req) {
  // 优先使用前端发送的设备ID
  if (req.body && req.body.deviceId) {
    return {
      deviceId: req.body.deviceId,
      deviceName: req.body.deviceName || '设备 ' + req.body.deviceId.substring(0, 5)
    };
  }
  
  // 否则通过IP地址识别
  const clientIP = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const ipHash = clientIP.replace(/[^0-9]/g, '').slice(-4) || 'unknown';
  
  return {
    deviceId: ipHash,
    deviceName: '设备 ' + ipHash
  };
}

// API路由

// 获取文件列表
app.get('/api/files', (req, res) => {
  try {
    const files = fs.readdirSync(UPLOAD_DIR);
    const metadata = readMetadata();
    
    const fileList = files
      .filter(filename => filename !== '.metadata.json')
      .map(filename => {
        const filePath = path.join(UPLOAD_DIR, filename);
        const stats = fs.statSync(filePath);
        const fileMetadata = metadata[filename] || {};
        
        return {
          name: filename,
          size: stats.size,
          sizeFormatted: formatFileSize(stats.size),
          modified: stats.mtime,
          deviceId: fileMetadata.deviceId || 'unknown',
          deviceName: fileMetadata.deviceName || '未知设备'
        };
      });
    fileList.sort((a, b) => b.modified - a.modified);
    res.json(fileList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 上传文件
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '没有文件被上传' });
  }
  
  // 获取设备信息：优先使用前端发送的信息，其次使用IP识别
  let deviceInfo = {
    deviceId: req.body.deviceId || '',
    deviceName: req.body.deviceName || ''
  };
  
  // 如果前端没有发送设备信息，使用IP地址进行识别
  if (!deviceInfo.deviceId) {
    deviceInfo = getClientDeviceInfo(req);
  }
  
  // 保存设备信息到metadata
  const metadata = readMetadata();
  metadata[req.file.originalname] = {
    deviceId: deviceInfo.deviceId,
    deviceName: deviceInfo.deviceName,
    uploadTime: new Date().toISOString()
  };
  saveMetadata(metadata);
  
  res.json({
    success: true,
    message: '文件上传成功',
    file: {
      name: req.file.originalname,
      size: req.file.size,
      sizeFormatted: formatFileSize(req.file.size),
      deviceId: deviceInfo.deviceId,
      deviceName: deviceInfo.deviceName
    }
  });
});

// 下载文件
app.get('/api/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(UPLOAD_DIR, filename);

  // 安全检查：防止路径遍历
  if (!path.resolve(filePath).startsWith(path.resolve(UPLOAD_DIR))) {
    return res.status(403).json({ error: '禁止访问' });
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: '文件不存在' });
  }

  res.download(filePath, filename);
});

// 删除文件
app.delete('/api/files/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(UPLOAD_DIR, filename);

  // 安全检查：防止路径遍历
  if (!path.resolve(filePath).startsWith(path.resolve(UPLOAD_DIR))) {
    return res.status(403).json({ error: '禁止访问' });
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: '文件不存在' });
  }

  try {
    fs.unlinkSync(filePath);
    
    // 从metadata中删除该文件的信息
    const metadata = readMetadata();
    delete metadata[filename];
    saveMetadata(metadata);
    
    res.json({ success: true, message: '文件删除成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取服务器信息
app.get('/api/server-info', (req, res) => {
  res.json({
    ip: getLocalIP(),
    port: PORT,
    url: `http://${getLocalIP()}:${PORT}`
  });
});

// 格式化文件大小
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIP();
  console.log('\n========================================');
  console.log('  局域网文件共享服务启动成功！');
  console.log('========================================');
  console.log(`  访问地址: http://${ip}:${PORT}`);
  console.log(`  本地访问: http://localhost:${PORT}`);
  console.log('========================================\n');
});

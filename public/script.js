// DOM元素
const uploadBox = document.getElementById('uploadBox');
const fileInput = document.getElementById('fileInput');
const filesList = document.getElementById('filesList');
const uploadProgress = document.getElementById('uploadProgress');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const serverUrlElement = document.getElementById('serverUrl');
const searchInput = document.getElementById('searchInput');
const fileCountElement = document.getElementById('fileCount');
const totalSizeElement = document.getElementById('totalSize');
const expirySelect = document.getElementById('expirySelect');
const snippetInput = document.getElementById('snippetInput');
const snippetExpirySelect = document.getElementById('snippetExpirySelect');
const snippetSendBtn = document.getElementById('snippetSendBtn');
const snippetsList = document.getElementById('snippetsList');

let allFiles = [];
let allSnippets = [];
let lastFilesHash = '';
let lastSnippetsHash = '';
let serverUrl = '';
let expandedDevices = {};
let deviceId = '';
let deviceName = '';

// 初始化设备ID
function initDeviceId() {
  const storedDeviceId = localStorage.getItem('CloudMateDeviceId');
  if (storedDeviceId) {
    try {
      const data = JSON.parse(storedDeviceId);
      deviceId = data.id;
      deviceName = data.name;
    } catch (e) {
      generateNewDeviceId();
    }
  } else {
    generateNewDeviceId();
  }
}

// 生成新的设备ID
function generateNewDeviceId() {
  const randomId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const osInfo = getOSInfo();
  deviceId = randomId.substring(0, 8);
  deviceName = osInfo;
  
  localStorage.setItem('CloudMateDeviceId', JSON.stringify({
    id: deviceId,
    name: deviceName
  }));
}

// 获取操作系统信息
function getOSInfo() {
  const ua = navigator.userAgent;
  if (ua.indexOf('Windows') > -1) return '💻 Windows';
  if (ua.indexOf('Mac') > -1) return '🍎 Mac';
  if (ua.indexOf('iPhone') > -1) return '📱 iPhone';
  if (ua.indexOf('iPad') > -1) return '📱 iPad';
  if (ua.indexOf('Android') > -1) return '🤖 Android';
  if (ua.indexOf('Linux') > -1) return '🐧 Linux';
  return '📱 设备';
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  initDeviceId();
  loadServerInfo();
  loadFiles();
  loadSnippets();
  setupEventListeners();
  setupLanguageToggle();
  // 每5秒刷新一次文件列表
  setInterval(loadFiles, 5000);
  setInterval(loadSnippets, 5000);
});

// 设置语言切换
function setupLanguageToggle() {
  const langToggle = document.getElementById('langToggle');
  if (langToggle) {
    langToggle.addEventListener('click', () => {
      const currentLang = getCurrentLanguage();
      const newLang = currentLang === 'zh' ? 'en' : 'zh';
      setLanguage(newLang);
    });
  }
}

// 设置事件监听
function setupEventListeners() {
  // 上传框点击
  uploadBox.addEventListener('click', () => {
    fileInput.click();
  });

  // 文件选择
  fileInput.addEventListener('change', handleFileSelect);

  // 拖放事件
  uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.classList.add('drag-over');
  });

  uploadBox.addEventListener('dragleave', () => {
    uploadBox.classList.remove('drag-over');
  });

  uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadBox.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    handleFiles(files);
  });

  // 搜索功能
  searchInput.addEventListener('input', (e) => {
    const keyword = e.target.value.toLowerCase();
    renderFiles(keyword);
  });

  if (snippetSendBtn) {
    snippetSendBtn.addEventListener('click', createSnippet);
  }

  // 点击模态框外部关闭
  document.getElementById('previewModal').addEventListener('click', (e) => {
    if (e.target.id === 'previewModal' || e.target.classList.contains('modal-overlay')) {
      closePreview();
    }
  });

  document.getElementById('shareModal').addEventListener('click', (e) => {
    if (e.target.id === 'shareModal' || e.target.classList.contains('modal-overlay')) {
      closeShare();
    }
  });
}

// 获取服务器信息
async function loadServerInfo() {
  try {
    const response = await fetch('/api/server-info');
    const data = await response.json();
    serverUrl = data.url;
    serverUrlElement.textContent = data.url;
    serverUrlElement.style.cursor = 'pointer';
    serverUrlElement.addEventListener('click', () => {
      navigator.clipboard.writeText(data.url)
        .then(() => {
          const original = serverUrlElement.textContent;
          serverUrlElement.textContent = '✓ 已复制';
          setTimeout(() => {
            serverUrlElement.textContent = original;
          }, 2000);
        })
        .catch(() => {
          alert('复制失败，请手动复制');
        });
    });
  } catch (error) {
    console.error('获取服务器信息失败:', error);
  }
}

// 处理文件选择
function handleFileSelect(e) {
  const files = e.target.files;
  handleFiles(files);
  // 清空input 允许再次选择同一文件
  fileInput.value = '';
}

// 处理文件列表
function handleFiles(files) {
  if (files.length === 0) return;

  Array.from(files).forEach((file, index) => {
    // 延迟上传，避免同时上传过多文件导致服务器压力
    setTimeout(() => {
      uploadFile(file);
    }, index * 500);
  });
}

// 上传文件
async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('deviceId', deviceId);
  formData.append('deviceName', deviceName);
  formData.append('expiresIn', expirySelect ? expirySelect.value : 'never');

  uploadProgress.style.display = 'block';
  progressFill.style.width = '0%';
  progressText.textContent = `上传中... ${file.name}`;

  try {
    const xhr = new XMLHttpRequest();

    // 监听上传进度
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100;
        progressFill.style.width = percentComplete + '%';
        progressText.textContent = `上传中... ${Math.round(percentComplete)}%`;
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        progressFill.style.width = '100%';
    progressText.textContent = '✓ 上传成功';
        setTimeout(() => {
        uploadProgress.style.display = 'none';
      loadFiles(); // 刷新文件列表
        }, 1000);
      } else {
        progressText.textContent = '✗ 上传失败';
        setTimeout(() => {
          uploadProgress.style.display = 'none';
        }, 2000);
      }
    });

    xhr.addEventListener('error', () => {
      progressText.textContent = '✗ 上传出错';
      setTimeout(() => {
        uploadProgress.style.display = 'none';
      }, 2000);
    });

    xhr.open('POST', '/api/upload');
    xhr.send(formData);
  } catch (error) {
    console.error('上传失败:', error);
    progressText.textContent = '✗ 上传失败';
    setTimeout(() => {
      uploadProgress.style.display = 'none';
    }, 2000);
  }
}

async function loadSnippets() {
  if (!snippetsList) return;

  try {
    const response = await fetch('/api/snippets');
    const snippets = await response.json();
    const newHash = JSON.stringify(snippets);

    if (newHash !== lastSnippetsHash) {
      allSnippets = snippets;
      lastSnippetsHash = newHash;
      renderSnippets();
    }
  } catch (error) {
    console.error('加载文本快传失败:', error);
    snippetsList.innerHTML = '<p class="empty-message">文本加载失败，请刷新重试</p>';
  }
}

async function createSnippet() {
  const text = snippetInput.value.trim();
  if (!text) {
    alert('请输入要发送的文本');
    return;
  }

  snippetSendBtn.disabled = true;
  snippetSendBtn.textContent = '发送中...';

  try {
    const response = await fetch('/api/snippets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        expiresIn: snippetExpirySelect ? snippetExpirySelect.value : '24h',
        deviceId,
        deviceName
      })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || '发送失败');
    }

    snippetInput.value = '';
    await loadSnippets();
  } catch (error) {
    alert(error.message || '发送失败');
  } finally {
    snippetSendBtn.disabled = false;
    snippetSendBtn.textContent = '发送文本';
  }
}

function renderSnippets() {
  if (!allSnippets.length) {
    snippetsList.innerHTML = '<p class="empty-message">暂无文本</p>';
    return;
  }

  snippetsList.innerHTML = allSnippets.map(snippet => `
    <div class="snippet-item">
      <div class="snippet-meta">
        <span>${escapeHtml(snippet.deviceName || '未知设备')}</span>
        <span>${formatDateTime(snippet.createdAt)}</span>
        <span>${formatExpiry(snippet.expiresAt)}</span>
      </div>
      <pre class="snippet-text">${escapeHtml(snippet.text)}</pre>
      <div class="snippet-item-actions">
        <button class="btn btn-download" onclick="copySnippet('${snippet.id}')">复制</button>
        <button class="btn btn-delete" onclick="deleteSnippet('${snippet.id}')">删除</button>
      </div>
    </div>
  `).join('');
}

function copySnippet(id) {
  const snippet = allSnippets.find(item => item.id === id);
  if (!snippet) return;

  navigator.clipboard.writeText(snippet.text)
    .then(() => alert('已复制'))
    .catch(() => alert('复制失败，请手动复制'));
}

async function deleteSnippet(id) {
  try {
    const response = await fetch(`/api/snippets/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('删除失败');
    await loadSnippets();
  } catch (error) {
    alert(error.message || '删除失败');
  }
}

// 加载文件列表（优化：只在文件真正变化时重新渲染）
async function loadFiles() {
  try {
    const response = await fetch('/api/files');
    const newFiles = await response.json();
    
    // 计算文件列表的哈希值，用于判断是否有变化
    const newHash = JSON.stringify(newFiles);
    
    // 只有文件列表变化时才重新渲染（避免加载动画闪烁）
    if (newHash !== lastFilesHash) {
      allFiles = newFiles;
      lastFilesHash = newHash;
      renderFiles(searchInput.value || '');
      updateStats();
    }
  } catch (error) {
    console.error('加载文件列表失败:', error);
    filesList.innerHTML = '<p class="empty-message">加载失败，请刷新重试</p>';
  }
}

// 按设备分组文件
function groupFilesByDevice(files) {
  const groups = {};
  
  files.forEach(file => {
    // 提取设备标识（文件元数据中的deviceId，默认为unknown）
    const deviceId = file.deviceId || 'unknown';
    const deviceName = file.deviceName || '未知设备';
    
    if (!groups[deviceId]) {
      groups[deviceId] = {
        name: deviceName,
        files: []
      };
    }
    groups[deviceId].files.push(file);
  });
  
  return groups;
}

// 切换设备分组
function toggleDevice(deviceId) {
  expandedDevices[deviceId] = !expandedDevices[deviceId];
  const filtered = searchInput.value || '';
  renderFiles(filtered);
}

// 渲染文件列表（按设备分类）
function renderFiles(keyword) {
  const filtered = allFiles.filter(file => 
    file.name.toLowerCase().includes(keyword)
  );

  if (filtered.length === 0) {
    filesList.innerHTML = '<p class="empty-message">' + t('files.empty') + '</p>';
    return;
  }

  // 按设备分组
  const groups = groupFilesByDevice(filtered);
  const groupIds = Object.keys(groups);

  filesList.innerHTML = groupIds.map(deviceId => {
    const group = groups[deviceId];
    const isExpanded = expandedDevices[deviceId] !== false; // 默认展开
    const fileCount = group.files.length;

    return `
      <div class="device-group">
        <div class="device-header" onclick="toggleDevice('${deviceId}')">
          <svg class="expand-icon ${isExpanded ? 'expanded' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
          <div class="device-info">
            <div class="device-name">📱 ${group.name}</div>
            <div class="device-count">${fileCount} 个文件</div>
          </div>
        </div>${t('files.stats.count')}
        <div class="device-files ${isExpanded ? 'expanded' : 'collapsed'}">
          ${group.files.map(file => {
            const ext = getFileExtension(file.name);
            const isPreviewable = isPreviewableFile(file.name);
            return `
              <div class="file-item">
                <div class="file-icon">${ext.toUpperCase()}</div>
                <div class="file-info">
                  <div class="file-name" title="${file.name}">${file.name}</div>
                  <div class="file-size">${file.sizeFormatted} · ${formatExpiry(file.expiresAt)}</div>
                </div>
                <div class="file-actions">
                  ${isPreviewable ? `<button class="btn btn-preview" onclick="openPreview('${encodeName(file.name)}', '${file.name}')">${t('actions.preview')}</button>` : ''}
                  <button class="btn btn-download" onclick="downloadFile('${encodeName(file.name)}')">${t('actions.download')}</button>
                  <button class="btn btn-share" onclick="openShare('${encodeName(file.name)}', '${file.name}')">${t('actions.share')}</button>
                  <button class="btn btn-delete" onclick="deleteFile('${encodeName(file.name)}', '${file.name}')">${t('actions.delete')}</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');
}

// 更新统计信息
function updateStats() {
  fileCountElement.textContent = allFiles.length;
  const totalBytes = allFiles.reduce((sum, file) => sum + file.size, 0);
  totalSizeElement.textContent = formatFileSize(totalBytes);
}

// 下载文件
function downloadFile(encodedName) {
  const link = document.createElement('a');
  link.href = `/api/download/${encodedName}`;
  link.click();
}

// 删除文件
async function deleteFile(encodedName, originalName) {
  if (!confirm(`${t('messages.confirmDelete')}`)) {
    return;
  }

  try {
    const response = await fetch(`/api/files/${encodedName}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      loadFiles(); // 刷新文件列表
      alert(t('messages.deleteSuccess'));
    } else {
      alert('删除失败');
    }
  } catch (error) {
    console.error('删除文件失败:', error);
    alert('删除失败');
  }
}

// 编码文件名（URL安全）
function encodeName(name) {
  return encodeURIComponent(name);
}

// 获取文件扩展名
function getFileExtension(filename) {
  const ext = filename.split('.').pop().substring(0, 3);
  return ext || 'FLE';
}

// 检查文件是否可预览
function isPreviewableFile(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const previewableExts = ['txt', 'md', 'json', 'xml', 'csv', 'jpg', 'jpeg', 'png', 'gif', 'webp'];
  return previewableExts.includes(ext);
}

// 打开预览
async function openPreview(encodedName, originalName) {
  const previewContent = document.getElementById('previewContent');
  const ext = originalName.split('.').pop().toLowerCase();

  try {
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      // 图片预览
      previewContent.innerHTML = `
        <div style="text-align: center;">
          <img src="/api/download/${encodedName}" style="max-width: 100%; max-height: 400px; border-radius: 6px;">
          <p style="margin-top: 10px; color: #546e7a; font-size: 12px;">${originalName}</p>
        </div>
      `;
    } else {
      // 文本预览
      const response = await fetch(`/api/download/${encodedName}`);
      const text = await response.text();
      const preview = text.substring(0, 1000) + (text.length > 1000 ? '\n\n...(仅显示前1000字符)' : '');
      previewContent.innerHTML = `
        <pre style="background: #f5f7fa; padding: 12px; border-radius: 4px; overflow: auto; max-height: 400px; font-size: 12px;">${escapeHtml(preview)}</pre>
      `;
    }
    document.getElementById('previewModal').classList.add('active');
  } catch (error) {
    alert(t('messages.noPreview'));
  }
}

// 关闭预览
function closePreview() {
  const modal = document.getElementById('previewModal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);
  }
}

// 打开分享
async function openShare(encodedName, originalName) {
  const shareLink = `${serverUrl}/api/download/${encodedName}`;
  const linkInput = document.getElementById('shareLink');
  const qrImg = document.getElementById('qrCode');
  const qrContainer = document.querySelector('.qr-code-container');
  
  if (!linkInput || !qrImg) {
    console.error('分享模态框元素丢失');
    alert('分享功能出错，请刷新重试');
    return;
  }
  
  linkInput.value = shareLink;
  
  try {
    qrImg.style.display = 'none'; // 隐藏图片以显示加载状态
    if (qrContainer) {
      qrContainer.innerHTML = `<p style="text-align: center; color: var(--text-secondary); font-size: 14px;">🔄 生成二维码中...</p>`;
    }
    
    const canvas = await QRCode.toCanvas(shareLink, {
      width: 200,
      margin: 2,
      color: {
        dark: '#6C7FD8',
        light: '#F5F8FC'
      },
      errorCorrectionLevel: 'Q'
    });
    
    qrImg.src = canvas.toDataURL('image/png');
    qrImg.style.display = 'block';
    if (qrContainer) {
      qrContainer.innerHTML = '';
      qrContainer.appendChild(qrImg);
      qrContainer.innerHTML += '<p style="font-size: 13px; color: var(--text-secondary); font-weight: 500; margin-top: 12px; text-align: center;">扫描二维码访问下载链接</p>';
    }
  } catch (error) {
    console.error('生成二维码失败:', error);
    if (qrContainer) {
      qrContainer.innerHTML = `<p style="color: var(--danger, #e74c3c); text-align: center; padding: 20px;">❌ 生成二维码失败<br><small>${error.message}</small></p>`;
    }
  }
  
  const modal = document.getElementById('shareModal');
  if (modal) {
    modal.style.display = 'flex';
    modal.classList.add('active');
  }
}

// 关闭分享
function closeShare() {
  const modal = document.getElementById('shareModal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);
  }
}

// 复制分享链接
function copyShareLink() {
  const shareLink = document.getElementById('shareLink');
  navigator.clipboard.writeText(shareLink.value)
    .then(() => {
      const btn = event.target;
      const original = btn.textContent;
      btn.textContent = '✓ 已复制';
      setTimeout(() => {
        btn.textContent = original;
      }, 2000);
    })
    .catch(() => {
      alert('复制失败');
    });
}

// HTML转义
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function formatDateTime(value) {
  if (!value) return '';
  return new Date(value).toLocaleString();
}

function formatExpiry(value) {
  if (!value) return '永久';

  const diff = new Date(value).getTime() - Date.now();
  if (diff <= 0) return '即将清理';

  const minutes = Math.ceil(diff / 60000);
  if (minutes < 60) return `${minutes}分钟后过期`;

  const hours = Math.ceil(minutes / 60);
  if (hours < 24) return `${hours}小时后过期`;

  return `${Math.ceil(hours / 24)}天后过期`;
}

// 格式化文件大小
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

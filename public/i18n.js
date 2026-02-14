// 国际化翻译文件
const i18n = {
  zh: {
    title: 'CloudMate - 优雅的文件共享',
    header: {
      title: 'CloudMate',
      subtitle: '优雅的局域网文件共享'
    },
    serverInfo: {
      label: '访问地址'
    },
    upload: {
      text: '点击或拖放文件',
      subtext: '支持多文件上传',
      uploading: '上传中...',
      success: '上传成功！',
      error: '上传失败'
    },
    files: {
      title: '📋 文件库',
      empty: '文件库为空',
      search: '搜索文件',
      stats: {
        count: '文件数',
        size: '已用'
      }
    },
    preview: {
      title: '👁 文件预览'
    },
    share: {
      title: '📤 分享文件',
      link: '下载链接',
      copy: '复制链接',
      copied: '已复制！'
    },
    actions: {
      download: '下载',
      delete: '删除',
      preview: '预览',
      share: '分享',
      close: '关闭',
      confirm: '确认',
      cancel: '取消'
    },
    messages: {
      confirmDelete: '确定要删除此文件吗？',
      deleteSuccess: '删除成功',
      noPreview: '暂无预览'
    },
    language: '中文'
  },
  en: {
    title: 'CloudMate - Elegant File Sharing',
    header: {
      title: 'CloudMate',
      subtitle: 'Elegant LAN File Sharing'
    },
    serverInfo: {
      label: 'Access Address'
    },
    upload: {
      text: 'Click or drag files',
      subtext: 'Support multiple file uploads',
      uploading: 'Uploading...',
      success: 'Upload successful!',
      error: 'Upload failed'
    },
    files: {
      title: '📋 File Library',
      empty: 'File library is empty',
      search: 'Search files',
      stats: {
        count: 'Files',
        size: 'Used'
      }
    },
    preview: {
      title: '👁 File Preview'
    },
    share: {
      title: '📤 Share File',
      link: 'Download Link',
      copy: 'Copy Link',
      copied: 'Copied!'
    },
    actions: {
      download: 'Download',
      delete: 'Delete',
      preview: 'Preview',
      share: 'Share',
      close: 'Close',
      confirm: 'Confirm',
      cancel: 'Cancel'
    },
    messages: {
      confirmDelete: 'Are you sure you want to delete this file?',
      deleteSuccess: 'Deleted successfully',
      noPreview: 'No preview available'
    },
    language: 'English'
  }
};

// 获取当前语言
function getCurrentLanguage() {
  const saved = localStorage.getItem('CloudMate_Language');
  if (saved && (saved === 'zh' || saved === 'en')) {
    return saved;
  }
  // 根据浏览器语言自动设置
  const browserLang = navigator.language.toLowerCase();
  return browserLang.startsWith('zh') ? 'zh' : 'en';
}

// 设置语言
function setLanguage(lang) {
  if (lang === 'zh' || lang === 'en') {
    localStorage.setItem('CloudMate_Language', lang);
    updateUILanguage();
  }
}

// 获取翻译文本
function t(key) {
  const lang = getCurrentLanguage();
  const keys = key.split('.');
  let value = i18n[lang];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
}

// 更新UI语言
function updateUILanguage() {
  // 更新页面标题
  document.title = t('title');
  
  // 更新所有带有data-i18n属性的元素
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  
  // 更新所有带有data-i18n-placeholder属性的输入框
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = t(key);
  });
  
  // 更新语言切换按钮文本
  const langBtn = document.getElementById('langToggle');
  if (langBtn) {
    const currentLang = getCurrentLanguage();
    langBtn.innerHTML = currentLang === 'zh' ? '🌐 English' : '🌐 中文';
  }
}

// 初始化语言
document.addEventListener('DOMContentLoaded', function() {
  updateUILanguage();
});

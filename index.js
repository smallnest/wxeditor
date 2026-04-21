/* ============================================================
   应用主逻辑
   ============================================================ */

(function () {
  const P = window.PRESETS;
  const THEMES = window.THEMES;
  const STORAGE_KEY = 'mp_md_formatter_v1';

  // ============ IndexedDB 图片存储（与 index.html 共用库名，便于数据互通） ============
  class ImageStore {
    constructor() {
      this.dbName = 'WechatEditorImages';
      this.storeName = 'images';
      this.version = 1;
      this.db = null;
    }
    async init() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, this.version);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          this.db = request.result;
          resolve();
        };
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(this.storeName)) {
            const objectStore = db.createObjectStore(this.storeName, { keyPath: 'id' });
            objectStore.createIndex('createdAt', 'createdAt', { unique: false });
            objectStore.createIndex('name', 'name', { unique: false });
          }
        };
      });
    }
    async saveImage(id, blob, metadata = {}) {
      if (!this.db) await this.init();
      return new Promise((resolve, reject) => {
        const tx = this.db.transaction([this.storeName], 'readwrite');
        const objectStore = tx.objectStore(this.storeName);
        const imageData = {
          id,
          blob,
          name: metadata.name || 'image',
          originalSize: metadata.originalSize || 0,
          compressedSize: blob.size,
          createdAt: Date.now(),
          ...metadata,
        };
        const request = objectStore.put(imageData);
        request.onsuccess = () => resolve(id);
        request.onerror = () => reject(request.error);
      });
    }
    async getImage(id) {
      if (!this.db) await this.init();
      return new Promise((resolve, reject) => {
        const tx = this.db.transaction([this.storeName], 'readonly');
        const request = tx.objectStore(this.storeName).get(id);
        request.onsuccess = () => {
          const result = request.result;
          if (result && result.blob) resolve(URL.createObjectURL(result.blob));
          else resolve(null);
        };
        request.onerror = () => reject(request.error);
      });
    }
    async getImageBlob(id) {
      if (!this.db) await this.init();
      return new Promise((resolve, reject) => {
        const tx = this.db.transaction([this.storeName], 'readonly');
        const request = tx.objectStore(this.storeName).get(id);
        request.onsuccess = () => {
          const result = request.result;
          resolve(result && result.blob ? result.blob : null);
        };
        request.onerror = () => reject(request.error);
      });
    }
    async getImageRecord(id) {
      if (!this.db) await this.init();
      return new Promise((resolve, reject) => {
        const tx = this.db.transaction([this.storeName], 'readonly');
        const request = tx.objectStore(this.storeName).get(id);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    }
  }

  class ImageCompressor {
    constructor(options = {}) {
      this.maxWidth = options.maxWidth || 1920;
      this.maxHeight = options.maxHeight || 1920;
      this.quality = options.quality || 0.85;
      this.mimeType = options.mimeType || 'image/jpeg';
    }
    async compress(file) {
      return new Promise((resolve, reject) => {
        if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
          resolve(file);
          return;
        }
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('文件读取失败'));
        reader.onload = (e) => {
          const img = new Image();
          img.onerror = () => reject(new Error('图片加载失败'));
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              let width = img.width;
              let height = img.height;
              let scale = 1;
              if (width > this.maxWidth) scale = this.maxWidth / width;
              if (height > this.maxHeight) scale = Math.min(scale, this.maxHeight / height);
              width = Math.floor(width * scale);
              height = Math.floor(height * scale);
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx.fillStyle = '#fff';
              ctx.fillRect(0, 0, width, height);
              ctx.drawImage(img, 0, 0, width, height);
              canvas.toBlob(
                (blob) => {
                  if (!blob) reject(new Error('Canvas toBlob 失败'));
                  else if (blob.size < file.size) resolve(blob);
                  else resolve(file);
                },
                file.type === 'image/png' ? 'image/png' : this.mimeType,
                this.quality
              );
            } catch (err) {
              reject(err);
            }
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      });
    }
    static formatSize(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
  }

  const imageStore = new ImageStore();
  const imageCompressor = new ImageCompressor({ maxWidth: 1920, maxHeight: 1920, quality: 0.85 });
  /** @type {Set<string>} blob: URLs created for preview — revoked before each re-render */
  const activePreviewObjectUrls = new Set();
  let turndownService = null;

  function revokeAllPreviewObjectUrls() {
    activePreviewObjectUrls.forEach((u) => {
      try { URL.revokeObjectURL(u); } catch (_e) {}
    });
    activePreviewObjectUrls.clear();
  }

  function preprocessMarkdown(content) {
    if (!content) return content;
    content = content.replace(/^[ ]{0,3}(\*[ ]*\*[ ]*\*[\* ]*)[ \t]*$/gm, '***');
    content = content.replace(/^[ ]{0,3}(-[ ]*-[ ]*-[- ]*)[ \t]*$/gm, '---');
    content = content.replace(/^[ ]{0,3}(_[ ]*_[ ]*_[_ ]*)[ \t]*$/gm, '___');
    content = content.replace(/\*\*\s+\*\*/g, ' ');
    content = content.replace(/\*{4,}/g, '');
    content = content.replace(/\*\*([）」』》〉】〕〗］｝"'。，、；：？！])/g, '**\u200B$1');
    content = content.replace(/([（「『《〈【〔〖［｛"'])\*\*/g, '$1\u200B**');
    content = content.replace(/__\s+__/g, ' ');
    content = content.replace(/_{4,}/g, '');
    content = content.replace(/^(\s*(?:\d+\.|-|\*)\s+[^:\n]+)\n\s*:\s*(.+?)$/gm, '$1: $2');
    content = content.replace(/^(\s*(?:\d+\.|-|\*)\s+.+?:)\s*\n\s+(.+?)$/gm, '$1 $2');
    content = content.replace(/^(\s*(?:\d+\.|-|\*)\s+[^:\n]+)\n:\s*(.+?)$/gm, '$1: $2');
    content = content.replace(/^(\s*(?:\d+\.|-|\*)\s+.+?)\n\n\s+(.+?)$/gm, '$1 $2');
    return content;
  }

  async function processImageProtocol(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const images = doc.querySelectorAll('img');
    for (const img of images) {
      const src = img.getAttribute('src');
      if (src && src.startsWith('img://')) {
        const imageId = src.replace('img://', '');
        try {
          const objectURL = await imageStore.getImage(imageId);
          if (objectURL) {
            activePreviewObjectUrls.add(objectURL);
            img.setAttribute('src', objectURL);
            img.setAttribute('data-image-id', imageId);
          } else {
            img.setAttribute('src', 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="120"%3E%3Crect fill="%23eee" width="200" height="120"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="12"%3E图片丢失%3C/text%3E%3C/svg%3E');
          }
        } catch (err) {
          console.warn('img:// 加载失败', imageId, err);
          img.setAttribute('src', 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="120"%3E%3Crect fill="%23fee" width="200" height="120"/%3E%3Ctext fill="%23c00" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="12"%3E加载失败%3C/text%3E%3C/svg%3E');
        }
      }
    }
    return doc.body.innerHTML;
  }

  function withTimeout(promise, ms, label) {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error(label || 'timeout')), ms)),
    ]);
  }

  async function recompressForClipboard(blob) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(blob);
      img.onload = () => {
        try {
          const maxDim = 1200;
          let w = img.naturalWidth;
          let h = img.naturalHeight;
          const ratio = Math.min(maxDim / w, maxDim / h, 1);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          canvas.toBlob(
            (result) => {
              URL.revokeObjectURL(url);
              if (result && result.size < blob.size) resolve(result);
              else resolve(blob);
            },
            'image/jpeg',
            0.6
          );
        } catch (e) {
          URL.revokeObjectURL(url);
          reject(e);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('图片加载失败'));
      };
      img.src = url;
    });
  }

  async function compressForClipboard(blob, mimeType) {
    if (blob.size > 1024 * 1024 && mimeType !== 'image/gif') {
      try {
        return await recompressForClipboard(blob);
      } catch (_e) {
        return blob;
      }
    }
    return blob;
  }

  // ============ 默认设置 ============
  function defaultSettings() {
    return JSON.parse(JSON.stringify(THEMES.claude));
  }

  // ============ State ============
  let state = {
    md: '',
    settings: defaultSettings(),
    customThemes: {}, // { id: {name, settings} }
    currentThemeKey: 'claude', // 'claude' | 'minimal' | ... or 'custom:id'
    settingsPaneCollapsed: false,
    editorPaneCollapsed: false,
    scrollSyncEnabled: true,
  };

  // ============ Persistence ============
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        md: state.md,
        settings: state.settings,
        customThemes: state.customThemes,
        currentThemeKey: state.currentThemeKey,
        settingsPaneCollapsed: state.settingsPaneCollapsed,
        editorPaneCollapsed: state.editorPaneCollapsed,
        scrollSyncEnabled: state.scrollSyncEnabled,
      }));
    } catch (e) {}
  }

  /** 非空白字符足够多才算「有正文」，避免仅空格/换行的脏数据跳过示例文 */
  function isValidMdContent(s) {
    if (!s || typeof s !== 'string') return false;
    if (s === 'false') return false;
    return s.replace(/\s/g, '').length >= 10;
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      // 只接受有效的 markdown 字符串（至少 10 个非空白字符）
      if (parsed.md && typeof parsed.md === 'string' && isValidMdContent(parsed.md)) {
        state.md = parsed.md;
      }
      if (parsed.settings) state.settings = parsed.settings;
      if (parsed.customThemes) state.customThemes = parsed.customThemes;
      if (parsed.currentThemeKey) state.currentThemeKey = parsed.currentThemeKey;
      if (typeof parsed.settingsPaneCollapsed === 'boolean') state.settingsPaneCollapsed = parsed.settingsPaneCollapsed;
      if (typeof parsed.editorPaneCollapsed === 'boolean') state.editorPaneCollapsed = parsed.editorPaneCollapsed;
      if (typeof parsed.scrollSyncEnabled === 'boolean') state.scrollSyncEnabled = parsed.scrollSyncEnabled;
      if (state.settings && state.settings.global && state.settings.global.maxWidth == null) {
        state.settings.global.maxWidth = 335;
      }
      return true;
    } catch (e) { return false; }
  }

  // ============ 示例文章 ============
  // 唯一数据源：同目录 sample.md（fetch）。本地请用静态服务打开目录，否则浏览器无法读本地文件。
  // 可选：在 index.html 里增加 <script type="text/plain" id="editor-sample-md">…</script>（勿含 </script> 字样），会作为第二顺位。
  const SAMPLE_MD_FALLBACK =
    '# Markdown 排版器\n\n' +
    '未能加载 `sample.md`。请在本目录执行 `python3 -m http.server` 后用 **http://** 打开页面；直接 **file://** 打开时浏览器禁止读取同目录文件。\n\n' +
    '[GitHub · article-tools](https://github.com/zhijunio/article-tools)';

  let sampleMdPromise = null;
  function loadSampleMd() {
    if (sampleMdPromise) return sampleMdPromise;
    sampleMdPromise = (async () => {
      try {
        const url = new URL('sample.md', window.location.href);
        const res = await fetch(url.toString(), { cache: 'no-cache' });
        if (res.ok) {
          const text = await res.text();
          if (isValidMdContent(text)) return text;
        }
      } catch (e) {
        console.warn('加载 sample.md 失败', e);
      }
      const embedded = document.getElementById('editor-sample-md');
      if (embedded && isValidMdContent(embedded.textContent)) {
        return embedded.textContent;
      }
      return SAMPLE_MD_FALLBACK;
    })();
    return sampleMdPromise;
  }

  // ============ 渲染预览 ============
  async function renderPreview() {
    revokeAllPreviewObjectUrls();
    const md = preprocessMarkdown(state.md || '');
    let html = window.renderMarkdown(md, state.settings);
    try {
      html = await processImageProtocol(html);
    } catch (e) {
      console.warn('processImageProtocol', e);
    }
    const box = document.getElementById('preview-content');
    if (box) box.innerHTML = html;
    if (state.editorPaneCollapsed) {
      const section = box ? box.querySelector(':scope > section') : null;
      if (section) section.style.maxWidth = '900px';
    }
    applyPreviewBg();
    updateMeta();
    save();
    const editor = document.getElementById('editor');
    const preview = document.getElementById('preview-scroll-root');
    if (editor && preview) {
      requestAnimationFrame(() => syncScrollRatio(editor, preview));
    }
  }

  function applyPreviewBg() {
    const frame = document.querySelector('.preview-frame');
    if (frame && state.settings.global && state.settings.global.bg) {
      frame.style.background = state.settings.global.bg;
    }
  }

  function updateMeta() {
    const text = (state.md || '').replace(/[#*_`~\->[\]()]/g, '');
    const chars = text.replace(/\s/g, '').length;
    const el = document.getElementById('meta-chars');
    if (el) el.textContent = chars + ' 字';
  }

  // ============ Toast ============
  let toastTimer;
  function toast(msg, durationMs) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), durationMs || 1800);
  }

  function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async function imageUrlToDataURL(url) {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error('图片加载失败：' + res.status);
    }
    const blob = await res.blob();
    return blobToDataURL(blob);
  }

  async function convertImageNodeToDataURL(img) {
    const imageId = img.getAttribute('data-image-id');
    if (imageId) {
      try {
        const record = await withTimeout(imageStore.getImageRecord(imageId), 8000, 'IndexedDB 读取超时');
        if (record && record.blob) {
          const mime = record.mimeType || record.blob.type || 'image/jpeg';
          const processed = await compressForClipboard(record.blob, mime);
          return blobToDataURL(processed);
        }
      } catch (e) {
        console.warn('本地图转 Base64 失败', imageId, e);
      }
    }
    const src = (img.getAttribute('src') || '').trim();
    if (!src) return null;
    if (src.startsWith('data:image/')) return src;
    if (src.startsWith('blob:')) {
      try {
        const res = await fetch(src);
        const blob = await res.blob();
        const processed = await compressForClipboard(blob, blob.type || 'image/jpeg');
        return blobToDataURL(processed);
      } catch (e) {
        console.warn('blob 图转 Base64 失败', e);
        return null;
      }
    }
    const absoluteUrl = new URL(src, window.location.href).href;
    return imageUrlToDataURL(absoluteUrl);
  }

  async function buildWechatCopyPayload() {
    const preview = document.getElementById('preview-content');
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div id="copy-root">${preview.innerHTML}</div>`, 'text/html');
    const root = doc.getElementById('copy-root');

    Array.from(root.querySelectorAll('a[href]')).forEach((a) => {
      const href = (a.getAttribute('href') || '').trim();
      let text = (a.textContent || '').trim();
      if (!text) {
        const image = a.querySelector('img');
        if (image) text = (image.getAttribute('alt') || '').trim() || '图片';
      }
      if (!href && !text) {
        a.remove();
        return;
      }
      const plain = href && text ? `${text} ${href}` : href || text;
      a.parentNode.replaceChild(doc.createTextNode(plain), a);
    });

    const images = Array.from(root.querySelectorAll('img'));
    let successCount = 0;
    let failCount = 0;
    for (const img of images) {
      try {
        const dataURL = await convertImageNodeToDataURL(img);
        if (dataURL) {
          img.setAttribute('src', dataURL);
          successCount++;
        }
      } catch (error) {
        failCount++;
        console.warn('图片转 Base64 失败:', img.getAttribute('src'), error);
      }
    }

    return {
      html: root.innerHTML,
      plain: root.innerText || root.textContent || '',
      imageCount: images.length,
      successCount,
      failCount,
    };
  }

  function clipboardFallback(html) {
    const container = document.createElement('div');
    container.contentEditable = 'true';
    container.innerHTML = html;
    container.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;';
    document.body.appendChild(container);

    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(container);
    sel.removeAllRanges();
    sel.addRange(range);
    document.execCommand('copy');
    sel.removeAllRanges();
    container.remove();
  }

  function syncScrollRatio(from, to) {
    const maxFrom = from.scrollHeight - from.clientHeight;
    const ratio = maxFrom > 0 ? from.scrollTop / maxFrom : 0;
    const maxTo = to.scrollHeight - to.clientHeight;
    to.scrollTop = ratio * Math.max(0, maxTo);
  }

  function bindScrollSync() {
    const editor = document.getElementById('editor');
    const preview = document.getElementById('preview-scroll-root');
    if (!editor || !preview) return;

    let locked = false;
    const sync = (from, to) => {
      if (!state.scrollSyncEnabled) return;
      if (locked) return;
      locked = true;
      syncScrollRatio(from, to);
      requestAnimationFrame(() => {
        locked = false;
      });
    };

    editor.addEventListener('scroll', () => sync(editor, preview), { passive: true });
    preview.addEventListener('scroll', () => sync(preview, editor), { passive: true });
  }

  function updateScrollSyncUI() {
    const track = document.getElementById('sync-scroll-track');
    const btn = document.getElementById('sync-scroll-switch');
    if (track) track.classList.toggle('on', state.scrollSyncEnabled);
    if (btn) btn.setAttribute('aria-pressed', String(state.scrollSyncEnabled));
  }

  function toggleScrollSync() {
    state.scrollSyncEnabled = !state.scrollSyncEnabled;
    updateScrollSyncUI();
    save();
  }

  function setEditorPaneCollapsed(collapsed) {
    state.editorPaneCollapsed = collapsed;
    const main = document.querySelector('.main');
    const toggle = document.getElementById('editor-toggle');
    const frame = document.querySelector('.preview-frame');
    const label = document.getElementById('preview-mode-label');
    if (main) {
      main.classList.toggle('editor-collapsed', collapsed);
    }
    if (toggle) {
      toggle.setAttribute('aria-expanded', String(!collapsed));
      toggle.setAttribute('aria-label', collapsed ? '展开编辑区域' : '折叠编辑区域');
      toggle.textContent = '◂';
    }
    if (collapsed) {
      if (frame) frame.style.width = '1024px';
      if (label) label.textContent = '预览区域（网页预览 · 1024px）';
    } else {
      if (frame) frame.style.width = '';
      if (label) label.textContent = '预览区域（手机预览 · 375px）';
    }
    save();
  }

  function setSettingsPaneCollapsed(collapsed) {
    state.settingsPaneCollapsed = collapsed;
    const main = document.querySelector('.main');
    const toggle = document.getElementById('settings-toggle');
    if (main) {
      main.classList.toggle('settings-collapsed', collapsed);
    }
    if (toggle) {
      toggle.setAttribute('aria-expanded', String(!collapsed));
      toggle.setAttribute('aria-label', collapsed ? '展开样式调节' : '折叠样式调节');
      toggle.textContent = '▸';
    }
    save();
  }

  // ============ 复制 ============
  async function copyRichText() {
    try {
      const previewEl = document.getElementById('preview-content');
      const imgN = previewEl ? previewEl.querySelectorAll('img').length : 0;
      if (imgN > 0) toast('正在处理图片…', 12000);
      const payload = await buildWechatCopyPayload();
      if (navigator.clipboard && window.ClipboardItem) {
        const item = new ClipboardItem({
          'text/html': new Blob([payload.html], { type: 'text/html' }),
          'text/plain': new Blob([payload.plain], { type: 'text/plain' }),
        });
        await navigator.clipboard.write([item]);
      } else {
        clipboardFallback(payload.html);
      }
      if (payload.imageCount > 0 && payload.failCount > 0) {
        toast(`✓ 已复制到公众号，${payload.failCount} 张图片保留原链接`);
      } else {
        toast('✓ 已复制到公众号');
      }
    } catch (e) {
      toast('复制失败：' + e.message);
    }
  }

  async function copyHTML() {
    const html = document.getElementById('preview-content').innerHTML;
    try {
      await navigator.clipboard.writeText(html);
      toast('✓ 已复制 HTML 源码');
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = html;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      toast('✓ 已复制 HTML 源码');
    }
  }

  // ============ 主题切换 ============
  function applyTheme(key) {
    state.currentThemeKey = key;
    if (key.startsWith('custom:')) {
      const id = key.slice(7);
      if (state.customThemes[id]) {
        state.settings = JSON.parse(JSON.stringify(state.customThemes[id].settings));
      }
    } else if (THEMES[key]) {
      state.settings = JSON.parse(JSON.stringify(THEMES[key]));
    }
    renderPreview();
    buildSettingsPanel();
    updateThemeSelect();
  }

  function updateThemeSelect() {
    const sel = document.getElementById('theme-select');
    sel.innerHTML = '';
    // 预设
    Object.entries(THEMES).forEach(([k, t]) => {
      const opt = document.createElement('option');
      opt.value = k;
      opt.textContent = t.name;
      sel.appendChild(opt);
    });
    // 自定义
    const entries = Object.entries(state.customThemes);
    if (entries.length) {
      const sep = document.createElement('option');
      sep.disabled = true;
      sep.textContent = '── 我的主题 ──';
      sel.appendChild(sep);
      entries.forEach(([id, t]) => {
        const opt = document.createElement('option');
        opt.value = 'custom:' + id;
        opt.textContent = t.name;
        sel.appendChild(opt);
      });
    }
    sel.value = state.currentThemeKey;
  }

  // ============ 保存自定义主题 ============
  function saveCustomTheme(name) {
    const id = 'c_' + Date.now();
    state.customThemes[id] = {
      name: name,
      settings: JSON.parse(JSON.stringify(state.settings)),
    };
    state.currentThemeKey = 'custom:' + id;
    save();
    updateThemeSelect();
    toast('✓ 主题「' + name + '」已保存');
  }

  function deleteCustomTheme(id) {
    delete state.customThemes[id];
    if (state.currentThemeKey === 'custom:' + id) {
      state.currentThemeKey = 'claude';
      applyTheme('claude');
    }
    save();
    updateThemeSelect();
    renderThemeList();
  }

  function renameCustomTheme(id, newName) {
    if (state.customThemes[id]) {
      state.customThemes[id].name = newName;
      save();
      updateThemeSelect();
      renderThemeList();
    }
  }

  function renderThemeList() {
    const wrap = document.getElementById('theme-list');
    if (!wrap) return;
    wrap.innerHTML = '';
    const entries = Object.entries(state.customThemes);
    if (!entries.length) {
      wrap.innerHTML = '<div style="font-size:11.5px; color:var(--ink-faint); padding:6px 2px;">尚无自定义主题。调整样式后点击「保存当前主题」。</div>';
      return;
    }
    entries.forEach(([id, t]) => {
      const item = document.createElement('div');
      item.className = 'theme-list-item';
      item.innerHTML = `
        <span class="name">${t.name}</span>
        <span class="controls">
          <button data-act="apply">应用</button>
          <button data-act="rename">重命名</button>
          <button data-act="del" class="del">删除</button>
        </span>
      `;
      item.querySelector('[data-act="apply"]').addEventListener('click', () => applyTheme('custom:' + id));
      item.querySelector('[data-act="rename"]').addEventListener('click', () => {
        const n = prompt('新名称', t.name);
        if (n && n.trim()) renameCustomTheme(id, n.trim());
      });
      item.querySelector('[data-act="del"]').addEventListener('click', () => {
        if (confirm('删除主题「' + t.name + '」？')) deleteCustomTheme(id);
      });
      wrap.appendChild(item);
    });
  }

  // ============ 导入/导出 JSON ============
  function exportJSON() {
    const data = {
      version: 1,
      currentSettings: state.settings,
      customThemes: state.customThemes,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'mp-theme-' + Date.now() + '.json';
    a.click();
    toast('✓ 已导出主题文件');
  }

  function importJSON(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (data.customThemes) {
          Object.assign(state.customThemes, data.customThemes);
        }
        if (data.currentSettings) {
          const id = 'import_' + Date.now();
          state.customThemes[id] = {
            name: '导入的主题',
            settings: JSON.parse(JSON.stringify(data.currentSettings)),
          };
          state.settings = JSON.parse(JSON.stringify(data.currentSettings));
          state.currentThemeKey = 'custom:' + id;
        }
        save();
        renderPreview();
        buildSettingsPanel();
        updateThemeSelect();
        renderThemeList();
        toast('✓ 导入完成');
      } catch (e) {
        toast('导入失败：JSON 格式错误');
      }
    };
    reader.readAsText(file);
  }

  // ============ Turndown + 智能粘贴 / 拖拽图片 ============
  function initTurndownService() {
    if (typeof TurndownService === 'undefined') {
      console.warn('Turndown 未加载，富文本粘贴将使用纯文本');
      return;
    }
    turndownService = new TurndownService({
      headingStyle: 'atx',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced',
      fence: '```',
      emDelimiter: '*',
      strongDelimiter: '**',
      linkStyle: 'inlined',
    });
    turndownService.keep(['table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td']);
    turndownService.addRule('table', {
      filter: 'table',
      replacement: (_content, node) => {
        const rows = Array.from(node.querySelectorAll('tr'));
        if (rows.length === 0) return '';
        let markdown = '\n\n';
        let headerProcessed = false;
        rows.forEach((row, index) => {
          const cells = Array.from(row.querySelectorAll('td, th'));
          const cellContents = cells.map((cell) => cell.textContent.replace(/\n/g, ' ').trim());
          if (cellContents.length > 0) {
            markdown += '| ' + cellContents.join(' | ') + ' |\n';
            if (index === 0 || (!headerProcessed && row.querySelector('th'))) {
              markdown += '| ' + cells.map(() => '---').join(' | ') + ' |\n';
              headerProcessed = true;
            }
          }
        });
        return markdown + '\n';
      },
    });
    turndownService.addRule('image', {
      filter: 'img',
      replacement: (_content, node) => {
        const alt = node.alt || '图片';
        const src = node.src || '';
        const title = node.title || '';
        if (src.startsWith('data:image')) {
          const type = src.match(/data:image\/(\w+);/)?.[1] || 'image';
          return `![${alt}](data:image/${type};base64,...)${title ? ` "${title}"` : ''}\n`;
        }
        return `![${alt}](${src})${title ? ` "${title}"` : ''}\n`;
      },
    });
  }

  function isMarkdown(text) {
    if (!text) return false;
    const patterns = [
      /^#{1,6}\s+/m,
      /\*\*[^*]+\*\*/,
      /\*[^*\n]+\*/,
      /\[[^\]]+\]\([^)]+\)/,
      /!\[[^\]]*\]\([^)]+\)/,
      /^[\*\-\+]\s+/m,
      /^\d+\.\s+/m,
      /^>\s+/m,
      /`[^`]+`/,
      /```[\s\S]*?```/,
      /^\|.*\|$/m,
      /<!--.*?-->/,
      /^---+$/m,
    ];
    const matchCount = patterns.filter((pattern) => pattern.test(text)).length;
    return matchCount >= 2 || text.includes('<!-- img:');
  }

  function isIDEFormattedHTML(htmlData, textData) {
    if (!htmlData || !textData) return false;
    const ideSignatures = [
      /<meta\s+charset=['"]utf-8['"]/i,
      /<div\s+class=["']ace_line["']/,
      /style=["'][^"']*font-family:\s*['"]?(?:Consolas|Monaco|Menlo|Courier)/i,
      function (html) {
        const hasDivSpan = /<(?:div|span)[\s>]/.test(html);
        const hasSemanticTags = /<(?:p|h[1-6]|strong|em|ul|ol|li|blockquote)[\s>]/i.test(html);
        return hasDivSpan && !hasSemanticTags;
      },
      function (html) {
        const strippedHtml = html.replace(/<[^>]+>/g, '').trim();
        return strippedHtml === textData.trim();
      },
    ];
    let matchCount = 0;
    for (const signature of ideSignatures) {
      if (typeof signature === 'function') {
        if (signature(htmlData)) matchCount++;
      } else if (signature.test(htmlData)) {
        matchCount++;
      }
    }
    return matchCount >= 2;
  }

  function insertTextAtCursor(textarea, text) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    const newValue = value.substring(0, start) + text + value.substring(end);
    textarea.value = newValue;
    state.md = newValue;
    const pos = start + text.length;
    textarea.selectionStart = textarea.selectionEnd = pos;
    textarea.focus();
    renderPreview();
  }

  async function handleImageUpload(file, textarea) {
    if (!file.type.startsWith('image/')) {
      toast('请上传图片文件');
      return;
    }
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast('图片大小不能超过 10MB');
      return;
    }
    const imageName = file.name.replace(/\.[^/.]+$/, '') || '图片';
    const originalSize = file.size;
    try {
      toast('正在压缩图片…', 4000);
      const compressedBlob = await imageCompressor.compress(file);
      const compressedSize = compressedBlob.size;
      const compressionRatio = ((1 - compressedSize / originalSize) * 100).toFixed(0);
      const imageId = `img-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      await imageStore.saveImage(imageId, compressedBlob, {
        name: imageName,
        originalName: file.name,
        originalSize,
        compressedSize,
        compressionRatio,
        mimeType: compressedBlob.type || file.type,
      });
      const markdownImage = `![${imageName}](img://${imageId})`;
      if (textarea) {
        const currentPos = textarea.selectionStart;
        const before = state.md.substring(0, currentPos);
        const after = state.md.substring(currentPos);
        state.md = before + markdownImage + after;
        textarea.value = state.md;
        const newPos = currentPos + markdownImage.length;
        textarea.selectionStart = textarea.selectionEnd = newPos;
        textarea.focus();
      } else {
        state.md = (state.md || '') + '\n' + markdownImage;
        const ed = document.getElementById('editor');
        if (ed) ed.value = state.md;
      }
      renderPreview();
      if (Number(compressionRatio) > 10) {
        toast(`已保存 (${ImageCompressor.formatSize(originalSize)} → ${ImageCompressor.formatSize(compressedSize)})`);
      } else {
        toast(`已保存 (${ImageCompressor.formatSize(compressedSize)})`);
      }
    } catch (error) {
      console.error(error);
      toast('图片处理失败：' + error.message);
    }
  }

  async function handleSmartPaste(event) {
    const clipboardData = event.clipboardData || event.originalEvent?.clipboardData;
    if (!clipboardData) return;

    if (clipboardData.files && clipboardData.files.length > 0) {
      const file = clipboardData.files[0];
      if (file && file.type && file.type.startsWith('image/')) {
        event.preventDefault();
        await handleImageUpload(file, event.target);
        return;
      }
    }

    const items = clipboardData.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file' && item.type && item.type.indexOf('image') !== -1) {
          event.preventDefault();
          const file = item.getAsFile();
          if (file) {
            await handleImageUpload(file, event.target);
            return;
          }
        }
      }
    }

    const htmlData = clipboardData.getData('text/html');
    const textData = clipboardData.getData('text/plain');

    if (textData && /^\[Image\s*#?\d*\]$/i.test(textData.trim())) {
      toast('请使用截图工具或拖拽文件插入图片');
      event.preventDefault();
      return;
    }

    const isFromIDE = isIDEFormattedHTML(htmlData, textData);
    if (isFromIDE && textData && isMarkdown(textData)) {
      return;
    }

    if (htmlData && htmlData.trim() !== '' && turndownService) {
      const hasPreTag = /<pre[\s>]/.test(htmlData);
      const hasCodeTag = /<code[\s>]/.test(htmlData);
      const isMainlyCode = (hasPreTag || hasCodeTag) && !htmlData.includes('<p') && !htmlData.includes('<div');

      if (isMainlyCode) {
        return;
      }

      if (htmlData.includes('file:///') || htmlData.includes('src="file:')) {
        toast('本地图片请拖拽文件到编辑区');
        event.preventDefault();
        return;
      }

      event.preventDefault();
      try {
        let markdown = turndownService.turndown(htmlData);
        markdown = markdown.replace(/\n{3,}/g, '\n\n');
        const textarea = event.target;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const value = textarea.value;
        const newValue = value.substring(0, start) + markdown + value.substring(end);
        textarea.value = newValue;
        state.md = newValue;
        textarea.selectionStart = textarea.selectionEnd = start + markdown.length;
        textarea.focus();
        renderPreview();
        toast('已智能转换为 Markdown');
      } catch (error) {
        console.error(error);
        if (textData) insertTextAtCursor(event.target, textData);
      }
    } else if (textData && isMarkdown(textData)) {
      return;
    }
  }

  // ============ 随机换色 / 随机风格 ============
  const HUE_SETS = [
    // [brand, brandSoft, textOnBrand, paraColor]
    ['#C96442', '#F5E3D7', '#FFFFFF', '#3D2E20'], // 暖橙
    ['#2563EB', '#DBEAFE', '#FFFFFF', '#1E293B'], // 科技蓝
    ['#059669', '#D1FAE5', '#FFFFFF', '#064E3B'], // 翠绿
    ['#7C3AED', '#EDE9FE', '#FFFFFF', '#1F1147'], // 紫
    ['#DB2777', '#FCE7F3', '#FFFFFF', '#500724'], // 玫粉
    ['#B87333', '#F5E0C3', '#FFFFFF', '#4A3728'], // 铜
    ['#0F766E', '#CCFBF1', '#FFFFFF', '#134E4A'], // 青
    ['#9333EA', '#F3E8FF', '#FFFFFF', '#3B0764'], // 亮紫
    ['#DC2626', '#FEE2E2', '#FFFFFF', '#450A0A'], // 中国红
    ['#1A1A1A', '#F0F0F0', '#FFFFFF', '#1A1A1A'], // 黑白
    ['#7A3B2E', '#E8D9C0', '#FFFFFF', '#3A2E1F'], // 复古红棕
    ['#0B3D66', '#DBEAFE', '#FFFFFF', '#0B3D66'], // 深蓝印
  ];

  function randomizeColors() {
    const pick = HUE_SETS[Math.floor(Math.random() * HUE_SETS.length)];
    const [brand, brandSoft, , ink] = pick;
    state.settings.global.brand = brand;
    state.settings.global.brandSoft = brandSoft;
    state.settings.global.ink = ink;

    // 所有使用主色的地方替换
    ['h1','h2','h3','h4'].forEach(h => {
      if (state.settings[h]) state.settings[h].color = brand;
    });
    if (state.settings.p) state.settings.p.color = ink;
    if (state.settings.blockquote) {
      state.settings.blockquote.color = brand;
      state.settings.blockquote.bgColor = brandSoft;
    }
    if (state.settings.code) {
      state.settings.code.color = brand;
      state.settings.code.bgColor = brandSoft;
    }
    if (state.settings.ul) state.settings.ul.color = brand;
    if (state.settings.ol) state.settings.ol.color = brand;
    if (state.settings.a) { state.settings.a.color = brand; state.settings.a.bgColor = brandSoft; }
    if (state.settings.hr) state.settings.hr.color = brand;
    if (state.settings.table) { state.settings.table.color = brand; state.settings.table.bgColor = brandSoft; }
    if (state.settings.bold) state.settings.bold.color = ink;

    renderPreview();
    buildSettingsPanel();
    toast('🎨 色系已换');
  }

  function randomizeStyle() {
    // 随机各元素的 preset
    const randPreset = (arr) => arr[Math.floor(Math.random() * arr.length)].id;
    state.settings.h1.preset = randPreset(P.h1);
    state.settings.h2.preset = randPreset(P.h2);
    state.settings.h3.preset = randPreset(P.h3);
    state.settings.h4.preset = randPreset(P.h4);
    state.settings.p.preset  = randPreset(P.p);
    state.settings.blockquote.preset = randPreset(P.blockquote);
    state.settings.pre.preset = randPreset(P.pre);
    state.settings.code.preset = randPreset(P.code);
    state.settings.ul.preset = randPreset(P.ul);
    state.settings.ol.preset = randPreset(P.ol);
    state.settings.a.preset  = randPreset(P.a);
    state.settings.img.preset = randPreset(P.img);
    state.settings.hr.preset  = randPreset(P.hr);
    state.settings.table.preset = randPreset(P.table);
    renderPreview();
    buildSettingsPanel();
    toast('🎲 风格已随机');
  }

  // ============ 样式面板 ============
  function buildSettingsPanel() {
    const root = document.getElementById('settings-body');
    root.innerHTML = '';

    // 1. 全局
    root.appendChild(makeAccordion('global', '全局样式', buildGlobalSection));
    // 2. H1-H4
    root.appendChild(makeAccordion('h1', '一级标题 H1', () => buildHeadingSection(1)));
    root.appendChild(makeAccordion('h2', '二级标题 H2', () => buildHeadingSection(2)));
    root.appendChild(makeAccordion('h3', '三级标题 H3', () => buildHeadingSection(3)));
    root.appendChild(makeAccordion('h4', '四级标题 H4', () => buildHeadingSection(4)));
    // 3. 正文
    root.appendChild(makeAccordion('p', '正文段落', buildParagraphSection));
    // 4. 加粗/斜体
    root.appendChild(makeAccordion('emph', '加粗 / 斜体', buildEmphSection));
    // 5. 引用
    root.appendChild(makeAccordion('bq', '引用 Blockquote', buildBlockquoteSection));
    // 6. 代码
    root.appendChild(makeAccordion('pre', '代码块', buildPreSection));
    // 7. 行内代码
    root.appendChild(makeAccordion('code', '行内代码', buildCodeSection));
    // 8. 列表
    root.appendChild(makeAccordion('list', '列表', buildListSection));
    // 9. 链接
    root.appendChild(makeAccordion('a', '链接', buildLinkSection));
    // 10. 图片
    root.appendChild(makeAccordion('img', '图片', buildImgSection));
    // 11. 分割线
    root.appendChild(makeAccordion('hr', '分割线', buildHrSection));
    // 12. 表格
    root.appendChild(makeAccordion('table', '表格', buildTableSection));
    // 13. 主题管理（无标题行，仅按钮与列表）
    const themesWrap = document.createElement('div');
    themesWrap.className = 'settings-themes-only';
    themesWrap.appendChild(buildThemesSection());
    root.appendChild(themesWrap);
  }

  /** 可折叠区块 */
  function makeAccordion(key, title, builder) {
    const wrap = document.createElement('div');
    wrap.className = 'accordion-item';
    wrap.dataset.key = key;

    const head = document.createElement('button');
    head.type = 'button';
    head.className = 'accordion-head';
    head.innerHTML = `<span>${title}</span><span class="chevron">▸</span>`;
    head.addEventListener('click', () => wrap.classList.toggle('open'));
    wrap.appendChild(head);

    const body = document.createElement('div');
    body.className = 'accordion-body';
    body.appendChild(builder());
    wrap.appendChild(body);
    return wrap;
  }

  // ============ 各个 section ============

  function makeField(label, input, valText) {
    const f = document.createElement('div');
    f.className = 'field';
    const l = document.createElement('div');
    l.className = 'field-label';
    l.innerHTML = `<span>${label}</span>${valText ? `<span class="val">${valText}</span>` : ''}`;
    f.appendChild(l);
    f.appendChild(input);
    return f;
  }

  function slider(min, max, step, value, onChange, fmt) {
    const wrap = document.createElement('div');
    const inp = document.createElement('input');
    inp.type = 'range';
    inp.min = min; inp.max = max; inp.step = step; inp.value = value;
    const val = document.createElement('span');
    val.className = 'val';
    val.textContent = fmt ? fmt(value) : value;
    inp.addEventListener('input', () => {
      val.textContent = fmt ? fmt(inp.value) : inp.value;
      onChange(Number(inp.value));
    });
    wrap.appendChild(inp);
    wrap._val = val;
    return wrap;
  }

  function sliderField(label, min, max, step, value, onChange, fmt) {
    const s = slider(min, max, step, value, onChange, fmt);
    return makeFieldInline(label, s, s._val);
  }
  function makeFieldInline(label, control, valEl) {
    const f = document.createElement('div');
    f.className = 'field';
    const l = document.createElement('div');
    l.className = 'field-label';
    const ls = document.createElement('span'); ls.textContent = label;
    l.appendChild(ls);
    if (valEl) l.appendChild(valEl);
    f.appendChild(l);
    f.appendChild(control);
    return f;
  }

  function colorField(label, value, onChange) {
    const wrap = document.createElement('div');
    wrap.className = 'color-pick';
    const c = document.createElement('input');
    c.type = 'color';
    c.value = value;
    const t = document.createElement('input');
    t.type = 'text';
    t.value = value;
    const sync = (v) => {
      c.value = v;
      t.value = v;
      onChange(v);
    };
    c.addEventListener('input', () => { t.value = c.value; onChange(c.value); });
    t.addEventListener('change', () => {
      if (/^#[0-9a-f]{6}$/i.test(t.value) || /^#[0-9a-f]{3}$/i.test(t.value)) sync(t.value);
      else t.value = c.value;
    });
    wrap.appendChild(c); wrap.appendChild(t);
    return makeFieldInline(label, wrap);
  }

  function seg(options, activeId, onChange) {
    const wrap = document.createElement('div');
    wrap.className = 'seg';
    options.forEach(o => {
      const b = document.createElement('button');
      b.textContent = o.name;
      if (o.id === activeId) b.classList.add('active');
      b.addEventListener('click', () => {
        wrap.querySelectorAll('button').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        onChange(o.id);
      });
      wrap.appendChild(b);
    });
    return wrap;
  }

  // 样式预设网格
  function presetGrid(presets, activeId, onChange, sampleText) {
    const grid = document.createElement('div');
    grid.className = 'preset-grid';
    presets.forEach(p => {
      const btn = document.createElement('button');
      btn.className = 'preset-chip' + (p.id === activeId ? ' active' : '');
      btn.innerHTML = `
        <span class="preview-sample">${sampleText ? sampleText(p) : p.name}</span>
        <span class="preset-name">${p.name}</span>
      `;
      btn.addEventListener('click', () => {
        grid.querySelectorAll('.preset-chip').forEach(x => x.classList.remove('active'));
        btn.classList.add('active');
        onChange(p.id);
      });
      grid.appendChild(btn);
    });
    return grid;
  }

  function update(field, value) {
    // set nested via path
    const parts = field.split('.');
    let o = state.settings;
    while (parts.length > 1) o = o[parts.shift()];
    o[parts[0]] = value;
    renderPreview();
  }

  // -- 全局
  function buildGlobalSection() {
    const box = document.createElement('div');
    const s = state.settings.global;

    box.appendChild(colorField('背景色', s.bg, v => { update('global.bg', v); applyPreviewBg(); }));
    box.appendChild(colorField('正文墨色', s.ink, v => {
      state.settings.global.ink = v;
      // cascade to paragraph + bold + headings (non-brand ones)
      if (state.settings.p) state.settings.p.color = v;
      if (state.settings.bold) state.settings.bold.color = v;
      renderPreview();
      buildSettingsPanel();
    }));
    box.appendChild(colorField('主色调', s.brand, v => {
      state.settings.global.brand = v;
      // cascade brand color to all brand-driven fields
      ['h1','h2','h3','h4'].forEach(k => { if (state.settings[k]) state.settings[k].color = v; });
      ['blockquote','code','ul','ol','a','hr','table'].forEach(k => { if (state.settings[k]) state.settings[k].color = v; });
      renderPreview();
      buildSettingsPanel();
    }));
    box.appendChild(colorField('主色柔底', s.brandSoft, v => {
      state.settings.global.brandSoft = v;
      ['blockquote','code','a','table'].forEach(k => { if (state.settings[k]) state.settings[k].bgColor = v; });
      renderPreview();
      buildSettingsPanel();
    }));

    // 字体族
    const ffWrap = document.createElement('select');
    ffWrap.className = 'txt';
    P.global.fontFamily.forEach(f => {
      const o = document.createElement('option');
      o.value = f.id; o.textContent = f.name;
      if (s.fontFamily === f.id) o.selected = true;
      ffWrap.appendChild(o);
    });
    ffWrap.addEventListener('change', () => update('global.fontFamily', ffWrap.value));
    box.appendChild(makeFieldInline('字体族', ffWrap));

    const mw = s.maxWidth != null ? s.maxWidth : 335;
    box.appendChild(sliderField('内容最大宽度', 280, 400, 1, mw, (v) => update('global.maxWidth', v), (v) => v + 'px'));

    return box;
  }

  // -- 标题通用
  function buildHeadingSection(level) {
    const key = 'h' + level;
    const s = state.settings[key];
    const box = document.createElement('div');

    box.appendChild(presetGrid(
      P[key], s.preset,
      id => update(key + '.preset', id),
      (p) => `<span style="font-size:${Math.min(s.fontSize, 15)}px; font-weight:700; color:${s.color};">${p.name.slice(0,4)}</span>`
    ));

    box.appendChild(sliderField('字号', 14, 32, 1, s.fontSize, v => update(key + '.fontSize', v), v => v + 'px'));
    box.appendChild(colorField('颜色', s.color, v => update(key + '.color', v)));
    return box;
  }

  // -- 正文
  function buildParagraphSection() {
    const s = state.settings.p;
    const box = document.createElement('div');

    box.appendChild(presetGrid(
      P.p, s.preset, id => update('p.preset', id),
      (p) => `<span style="font-size:13px; color:${s.color}">${p.name}</span>`
    ));
    box.appendChild(sliderField('字号', 12, 22, 1, s.fontSize, v => update('p.fontSize', v), v => v + 'px'));
    box.appendChild(sliderField('行距', 1.4, 2.2, 0.05, s.lineHeight, v => update('p.lineHeight', v), v => Number(v).toFixed(2)));
    box.appendChild(sliderField('字间距', 0, 2, 0.1, s.letterSpacing, v => update('p.letterSpacing', v), v => Number(v).toFixed(1) + 'px'));
    box.appendChild(colorField('颜色', s.color, v => update('p.color', v)));
    return box;
  }

  // -- 加粗 斜体
  function buildEmphSection() {
    const box = document.createElement('div');
    box.appendChild(colorField('加粗颜色', state.settings.bold.color, v => update('bold.color', v)));
    box.appendChild(colorField('斜体颜色', state.settings.italic.color, v => update('italic.color', v)));
    return box;
  }

  // -- 引用
  function buildBlockquoteSection() {
    const s = state.settings.blockquote;
    const box = document.createElement('div');
    box.appendChild(presetGrid(P.blockquote, s.preset, id => update('blockquote.preset', id)));
    box.appendChild(sliderField('字号', 12, 20, 1, s.fontSize, v => update('blockquote.fontSize', v), v => v + 'px'));
    box.appendChild(colorField('主色', s.color, v => update('blockquote.color', v)));
    box.appendChild(colorField('文字色', s.textColor, v => update('blockquote.textColor', v)));
    box.appendChild(colorField('背景色', s.bgColor, v => update('blockquote.bgColor', v)));
    return box;
  }

  // -- 代码块
  function buildPreSection() {
    const s = state.settings.pre;
    const box = document.createElement('div');
    box.appendChild(presetGrid(P.pre, s.preset, id => update('pre.preset', id)));
    return box;
  }

  // -- 行内代码
  function buildCodeSection() {
    const s = state.settings.code;
    const box = document.createElement('div');
    box.appendChild(presetGrid(P.code, s.preset, id => update('code.preset', id),
      (p) => `<code style="background:${s.bgColor}; color:${s.color}; padding:1px 5px; border-radius:3px; font-size:11px;">code</code>`));
    box.appendChild(colorField('文字色', s.color, v => update('code.color', v)));
    box.appendChild(colorField('背景色', s.bgColor, v => update('code.bgColor', v)));
    return box;
  }

  // -- 列表
  function buildListSection() {
    const s = state.settings;
    const box = document.createElement('div');

    const ulH = document.createElement('div');
    ulH.style.cssText = 'font-size:11.5px; color:var(--ink-soft); font-weight:600; margin:4px 0 8px;';
    ulH.textContent = '无序列表符号';
    box.appendChild(ulH);
    box.appendChild(presetGrid(P.ul, s.ul.preset, id => update('ul.preset', id),
      (p) => `<span style="color:${s.ul.color}; font-size:14px;">${p.marker} 列表项</span>`));
    box.appendChild(colorField('符号颜色', s.ul.color, v => update('ul.color', v)));

    const olH = document.createElement('div');
    olH.style.cssText = 'font-size:11.5px; color:var(--ink-soft); font-weight:600; margin:18px 0 8px;';
    olH.textContent = '有序列表编号';
    box.appendChild(olH);
    box.appendChild(presetGrid(P.ol, s.ol.preset, id => update('ol.preset', id),
      (p) => `<span style="color:${s.ol.color}; font-size:12px;">${p.name}</span>`));
    box.appendChild(colorField('编号颜色', s.ol.color, v => update('ol.color', v)));
    return box;
  }

  // -- 链接
  function buildLinkSection() {
    const s = state.settings.a;
    const box = document.createElement('div');
    box.appendChild(presetGrid(P.a, s.preset, id => update('a.preset', id)));
    box.appendChild(colorField('颜色', s.color, v => update('a.color', v)));
    return box;
  }

  // -- 图片
  function buildImgSection() {
    const s = state.settings.img;
    const box = document.createElement('div');
    box.appendChild(presetGrid(P.img, s.preset, id => update('img.preset', id)));
    return box;
  }

  // -- 分割线
  function buildHrSection() {
    const s = state.settings.hr;
    const box = document.createElement('div');
    box.appendChild(presetGrid(P.hr, s.preset, id => update('hr.preset', id),
      (p) => p.decorative ? `<span style="color:${s.color}; font-size:12px; letter-spacing:6px;">${p.decorative}</span>` : `<span style="color:${s.color}; font-size:11px;">${p.name}</span>`));
    box.appendChild(colorField('颜色', s.color, v => update('hr.color', v)));
    return box;
  }

  // -- 表格
  function buildTableSection() {
    const s = state.settings.table;
    const box = document.createElement('div');
    box.appendChild(presetGrid(P.table, s.preset, id => update('table.preset', id)));
    box.appendChild(colorField('主色', s.color, v => update('table.color', v)));
    box.appendChild(colorField('柔底色', s.bgColor, v => update('table.bgColor', v)));
    return box;
  }

  // -- 主题
  function buildThemesSection() {
    const box = document.createElement('div');

    const save = document.createElement('button');
    save.className = 'btn primary';
    save.style.width = '100%';
    save.textContent = '保存当前样式为新主题';
    save.addEventListener('click', () => {
      const n = prompt('为这套主题起个名字：', '我的主题 ' + (Object.keys(state.customThemes).length + 1));
      if (n && n.trim()) saveCustomTheme(n.trim());
    });
    box.appendChild(save);

    const row = document.createElement('div');
    row.style.cssText = 'display:flex; gap:6px; margin-top:8px;';
    const exp = document.createElement('button');
    exp.className = 'btn'; exp.style.flex = '1'; exp.textContent = '导出 JSON';
    exp.addEventListener('click', exportJSON);
    const imp = document.createElement('button');
    imp.className = 'btn'; imp.style.flex = '1'; imp.textContent = '导入 JSON';
    imp.addEventListener('click', () => document.getElementById('import-file').click());
    row.appendChild(exp); row.appendChild(imp);
    box.appendChild(row);

    const list = document.createElement('div');
    list.id = 'theme-list';
    list.className = 'theme-list';
    box.appendChild(list);

    // defer render
    setTimeout(renderThemeList, 0);
    return box;
  }

  // ============ 绑定顶栏 ============
  function bindTopbar() {
    document.getElementById('theme-select').addEventListener('change', e => applyTheme(e.target.value));
    document.getElementById('btn-copy-rich').addEventListener('click', copyRichText);
    document.getElementById('btn-copy-html').addEventListener('click', copyHTML);
    document.getElementById('btn-rand-color').addEventListener('click', randomizeColors);
    document.getElementById('btn-rand-style').addEventListener('click', randomizeStyle);
    document.getElementById('btn-reset').addEventListener('click', () => {
      if (confirm('重置为暖棕书卷主题？自定义主题不会被删除。')) {
        localStorage.clear();
        location.reload();
      }
    });
    document.getElementById('sync-scroll-switch').addEventListener('click', () => {
      toggleScrollSync();
    });
    document.getElementById('btn-sample').addEventListener('click', () => {
      void (async () => {
        sampleMdPromise = null;
        const md = await loadSampleMd();
        const ed = document.getElementById('editor');
        ed.value = md;
        state.md = md;
        await renderPreview();
        toast('已填入示例 Markdown');
      })();
    });
    document.getElementById('import-file').addEventListener('change', e => {
      const f = e.target.files[0];
      if (f) importJSON(f);
      e.target.value = '';
    });
    document.getElementById('settings-toggle').addEventListener('click', () => {
      setSettingsPaneCollapsed(!state.settingsPaneCollapsed);
    });
    document.getElementById('editor-toggle').addEventListener('click', () => {
      setEditorPaneCollapsed(!state.editorPaneCollapsed);
    });
  }

  // ============ 初始化 ============
  async function init() {
    initTurndownService();
    try {
      await imageStore.init();
    } catch (e) {
      console.warn('IndexedDB 初始化失败', e);
    }

    load();
    // 如果没有数据或数据无效，使用示例文章（sample.md）
    const hasValidMd = isValidMdContent(state.md);
    if (!hasValidMd) {
      state.md = await loadSampleMd();
    }

    const ed = document.getElementById('editor');
    ed.value = state.md;
    ed.addEventListener('input', (e) => {
      state.md = e.target.value;
      renderPreview();
    });
    ed.addEventListener('paste', (e) => {
      void handleSmartPaste(e);
    });
    ed.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      ed.classList.add('editor-dragover');
    });
    ed.addEventListener('dragleave', () => ed.classList.remove('editor-dragover'));
    ed.addEventListener('drop', (e) => {
      e.preventDefault();
      ed.classList.remove('editor-dragover');
      const file = e.dataTransfer.files && e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        void handleImageUpload(file, ed);
      } else if (e.dataTransfer.files && e.dataTransfer.files.length) {
        toast('只支持拖拽图片文件');
      }
    });

    bindTopbar();
    bindScrollSync();
    updateScrollSyncUI();
    buildSettingsPanel();
    updateThemeSelect();
    setSettingsPaneCollapsed(state.settingsPaneCollapsed);
    setEditorPaneCollapsed(state.editorPaneCollapsed);
    await renderPreview();

    if (!hasValidMd) toast('欢迎！已加载示例内容，开始编辑吧');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      void init();
    });
  } else {
    void init();
  }
})();

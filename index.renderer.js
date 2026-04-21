/* ============================================================
   Renderer: Markdown -> HTML with inline styles
   生成后可直接粘贴到公众号后台
   ============================================================ */

(function () {
  const P = window.PRESETS;

  function toCircled(n) {
    const map = ['⓪','①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩','⑪','⑫','⑬','⑭','⑮','⑯','⑰','⑱','⑲','⑳'];
    return map[n] || (n + '.');
  }
  function toChinese(n) {
    const map = ['零','一','二','三','四','五','六','七','八','九','十'];
    if (n <= 10) return map[n] + '、';
    if (n < 20) return '十' + map[n-10] + '、';
    if (n === 20) return '二十、';
    return n + '、';
  }
  function toSquareNum(n) {
    // 使用方块内的数字
    return String(n);
  }
  function fillStyle(tpl, vars) {
    return String(tpl).replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : ''));
  }

  function escapeAttr(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;');
  }
  function escapeHtmlText(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // ============ 找预设 ============
  function find(list, id) {
    return list.find(p => p.id === id) || list[0];
  }

  // ============ 构建每种元素的 inline style ============
  function buildHeading(level, cfg, settings) {
    const list = P['h' + level] || P.h2;
    const preset = find(list, cfg.preset);
    const vars = {
      fs: cfg.fontSize,
      c: cfg.color,
      cbg: settings.global.brandSoft,
    };
    let style = fillStyle(preset.style, vars);
    return { preset, style, vars };
  }

  function buildParagraph(cfg) {
    const preset = find(P.p, cfg.preset);
    const vars = {
      fs: cfg.fontSize,
      c: cfg.color,
      lh: cfg.lineHeight,
      ls: cfg.letterSpacing,
    };
    return fillStyle(preset.style, vars);
  }

  function buildBlockquote(cfg) {
    const preset = find(P.blockquote, cfg.preset);
    const vars = {
      c: cfg.color,
      tc: cfg.textColor,
      cbg: cfg.bgColor,
      fs: cfg.fontSize,
    };
    return { preset, style: fillStyle(preset.style, vars) };
  }

  function buildPre(cfg) {
    const preset = find(P.pre, cfg.preset);
    return { preset, style: fillStyle(preset.style, { c: cfg.color || '#C96442' }) };
  }

  function buildCode(cfg) {
    const preset = find(P.code, cfg.preset);
    return fillStyle(preset.style, { c: cfg.color, cbg: cfg.bgColor });
  }

  function buildLink(cfg) {
    const preset = find(P.a, cfg.preset);
    return { preset, style: fillStyle(preset.style, { c: cfg.color, cbg: cfg.bgColor || '#F5E3D7' }) };
  }

  function buildHr(cfg) {
    const preset = find(P.hr, cfg.preset);
    return { preset, style: fillStyle(preset.style, { c: cfg.color }) };
  }

  function buildImg(cfg) {
    const preset = find(P.img, cfg.preset);
    return preset;
  }

  function buildTable(cfg) {
    const preset = find(P.table, cfg.preset);
    // 网格线统一用主题色，避免表头 {c} 与单元格 hair 分两色
    const vars = { c: cfg.color, cbg: cfg.bgColor, hair: cfg.color };
    return {
      preset,
      tableStyle: fillStyle(preset.tableStyle, vars),
      thStyle: fillStyle(preset.thStyle, vars),
      tdStyle: fillStyle(preset.tdStyle, vars),
      zebra: preset.zebra,
      zebraColor: preset.zebraColor ? fillStyle(preset.zebraColor, vars) : null,
    };
  }

  // ============ 自定义 marked renderer ============
  function makeRenderer(settings) {
    const renderer = new marked.Renderer();
    const g = settings.global;

    // --- 标题（须单次赋值；marked 会传入 depth，不能 forEach 覆盖） ---
    renderer.heading = function (text, lvl) {
      const key = 'h' + lvl;
      const cfg = settings[key] || settings.h2;
      const { preset, style } = buildHeading(lvl, cfg, settings);
      let content = text;

      if (preset.prefix) content = preset.prefix + content;
      if (preset.suffix) content = content + preset.suffix;

      if (preset.badge) {
        const badgeStyle = `display:inline-flex; align-items:center; justify-content:center; min-width:30px; height:30px; border-radius:50%; background:${cfg.color}; color:#fff; font-size:15px; font-weight:700; flex-shrink:0;`;
        if (!renderer._hCount) renderer._hCount = {};
        renderer._hCount[lvl] = (renderer._hCount[lvl] || 0) + 1;
        return `<h${lvl} style="${style}"><span style="${badgeStyle}">${renderer._hCount[lvl]}</span><span>${text}</span></h${lvl}>`;
      }
      if (preset.badgeSq) {
        const badgeStyle = `display:inline-flex; align-items:center; justify-content:center; min-width:24px; height:24px; border-radius:4px; background:${cfg.color}; color:#fff; font-size:13px; font-weight:700; flex-shrink:0;`;
        if (!renderer._hCount) renderer._hCount = {};
        renderer._hCount[lvl] = (renderer._hCount[lvl] || 0) + 1;
        return `<h${lvl} style="${style}"><span style="${badgeStyle}">${renderer._hCount[lvl]}</span><span>${text}</span></h${lvl}>`;
      }
      if (preset.numPrefix) {
        if (!renderer._hCount) renderer._hCount = {};
        renderer._hCount[lvl] = (renderer._hCount[lvl] || 0) + 1;
        const n = renderer._hCount[lvl];
        return `<h${lvl} style="${style}"><span style="color:${cfg.color}; margin-right:8px; font-family:Georgia,serif;">${String(n).padStart(2,'0')}</span>${content}</h${lvl}>`;
      }

      return `<h${lvl} style="${style}">${content}</h${lvl}>`;
    };

    // --- 段落 ---
    renderer.paragraph = function (text) {
      const style = buildParagraph(settings.p);
      return `<p style="${style}">${text}</p>`;
    };

    // --- 引用 ---
    renderer.blockquote = function (quote) {
      const { preset, style } = buildBlockquote(settings.blockquote);
      const cfg = settings.blockquote;

      let inner = quote;
      if (preset.quotemark) {
        inner = `<span style="position:absolute; left:10px; top:6px; font-size:32px; line-height:1; color:${cfg.color}; font-family:Georgia,serif;">"</span>${quote}`;
      }
      if (preset.notice) {
        inner = `<span style="position:absolute; left:12px; top:12px; font-size:15px; color:${cfg.color};">💡</span>${quote}`;
      }

      // 去掉嵌套 p 的 margin
      inner = inner.replace(/<p style="[^"]*">/g, '<p style="margin:0;">');

      return `<blockquote style="${style}">${inner}</blockquote>`;
    };

    // --- 代码块（highlight.js 着色，失败则纯文本转义） ---
    renderer.code = function (code, lang) {
      const { style } = buildPre(settings.pre);
      // 浅色底放在末尾，覆盖预设里可能出现的深色 background，复制到公众号也一致
      const lightShell = 'background:#f5f7fa;border:1px solid #e2e8f0;color:#1e293b;white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere;overflow-x:hidden';
      const preStyle = `${style};${lightShell}`;
      const esc = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      let inner = esc;
      if (typeof hljs !== 'undefined' && hljs.highlight) {
        try {
          const l = (lang || '').trim().toLowerCase();
          if (l && hljs.getLanguage && hljs.getLanguage(l)) {
            inner = hljs.highlight(code, { language: l }).value;
          } else {
            inner = hljs.highlightAuto(code).value;
          }
        } catch (_e) {
          try {
            inner = hljs.highlightAuto(code).value;
          } catch (_e2) {
            inner = esc;
          }
        }
      }
      const codeShell = 'background:transparent;padding:0;color:inherit;font-family:inherit;font-size:inherit;white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere';
      return `<pre style="${preStyle}"><code class="hljs" style="${codeShell}">${inner}</code></pre>`;
    };

    // --- 行内代码 ---
    renderer.codespan = function (code) {
      const style = buildCode(settings.code);
      const esc = String(code).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<code style="${style}">${esc}</code>`;
    };

    // --- 列表 ---
    renderer.list = function (body, ordered, start) {
      if (ordered) {
        const cfg = settings.ol;
        const preset = find(P.ol, cfg.preset);
        // 给每个 li 加序号（我们在 listitem 里处理，这里用 data 传递）
        const containerStyle = `margin:14px 0; padding-left:0; list-style:none; color:${settings.p.color};`;
        return `<ol data-ol-start="${start || 1}" data-ol-preset="${preset.id}" data-ol-color="${cfg.color}" style="${containerStyle}">${body}</ol>`;
      } else {
        const cfg = settings.ul;
        const preset = find(P.ul, cfg.preset);
        const containerStyle = `margin:14px 0; padding-left:0; list-style:none; color:${settings.p.color};`;
        return `<ul data-ul-marker="${preset.marker}" data-ul-color="${cfg.color}" style="${containerStyle}">${body}</ul>`;
      }
    };

    renderer.listitem = function (text) {
      // 使用 flex 布局让序号对齐
      const itemStyle = `display:flex; gap:8px; align-items:flex-start; margin:6px 0; line-height:${settings.p.lineHeight}; font-size:${settings.p.fontSize}px; color:${settings.p.color};`;
      // 嵌套段落去掉外 margin
      const inner = text.replace(/<p style="[^"]*">/g, '<span style="display:inline;">').replace(/<\/p>/g, '</span>');
      return `<li style="${itemStyle}"><!--LI_MARKER_PLACEHOLDER--><span style="flex:1;">${inner}</span></li>`;
    };

    // --- 链接 ---
    renderer.link = function (href, title, text) {
      const { preset, style } = buildLink(settings.a);
      let display = text;
      if (preset.suffix) display = display + preset.suffix;
      return `<a href="${href}" style="${style}">${display}</a>`;
    };

    // --- 图片 ---
    renderer.image = function (href, title, text) {
      const preset = buildImg(settings.img);
      const rawAlt = text || '';
      const imgHtml = `<img src="${escapeAttr(href)}" alt="${escapeAttr(rawAlt)}" style="${preset.imgStyle}">`;
      if (text) {
        return `<figure style="margin:0;">${imgHtml}<figcaption style="${preset.capStyle}">${escapeHtmlText(text)}</figcaption></figure>`;
      }
      return imgHtml;
    };

    // --- hr ---
    renderer.hr = function () {
      const { preset, style } = buildHr(settings.hr);
      if (preset.decorative) {
        return `<p style="${style}">${preset.decorative}</p>`;
      }
      return `<hr style="${style}">`;
    };

    // --- 粗体、斜体、删除线 ---
    renderer.strong = function (text) {
      return `<strong style="font-weight:700; color:${settings.bold.color};">${text}</strong>`;
    };
    renderer.em = function (text) {
      return `<em style="font-style:italic; color:${settings.italic.color};">${text}</em>`;
    };
    renderer.del = function (text) {
      return `<del style="text-decoration:line-through; color:#9C8E7F;">${text}</del>`;
    };

    // --- 表格 ---
    renderer.table = function (header, body) {
      const t = buildTable(settings.table);
      let bodyOut = body;
      if (t.zebra && t.zebraColor) {
        // 为偶数行注入背景
        let rowIdx = 0;
        bodyOut = body.replace(/<tr>/g, () => {
          rowIdx++;
          return rowIdx % 2 === 0 ? `<tr style="background:${t.zebraColor};">` : '<tr>';
        });
      }
      return `<table style="${t.tableStyle}"><thead>${header}</thead><tbody>${bodyOut}</tbody></table>`;
    };
    renderer.tablerow = function (content) { return `<tr>${content}</tr>`; };
    renderer.tablecell = function (content, flags) {
      const t = buildTable(settings.table);
      const style = flags.header ? t.thStyle : t.tdStyle;
      const alignStyle = flags.align ? `text-align:${flags.align};` : '';
      return `<${flags.header ? 'th' : 'td'} style="${style}${alignStyle}">${content}</${flags.header ? 'th' : 'td'}>`;
    };

    renderer.br = function () { return '<br>'; };

    return renderer;
  }

  // ============ 后处理：替换列表 marker 占位 ============
  function applyListMarkers(html) {
    const tpl = document.createElement('div');
    tpl.innerHTML = html;

    // UL
    tpl.querySelectorAll('ul[data-ul-marker]').forEach(ul => {
      const marker = ul.getAttribute('data-ul-marker');
      const color = ul.getAttribute('data-ul-color');
      ul.querySelectorAll(':scope > li').forEach(li => {
        const span = document.createElement('span');
        span.setAttribute('style', `color:${color}; flex-shrink:0; width:1.3em; text-align:left; line-height:inherit;`);
        span.textContent = marker;
        const placeholder = li.querySelector('li > *:first-child') || li.firstChild;
        // 替换占位注释
        const walker = document.createNodeIterator(li, NodeFilter.SHOW_COMMENT);
        let n;
        while ((n = walker.nextNode())) {
          if (n.nodeValue === 'LI_MARKER_PLACEHOLDER') {
            n.parentNode.replaceChild(span, n);
            break;
          }
        }
      });
    });

    // OL
    tpl.querySelectorAll('ol[data-ol-start]').forEach(ol => {
      const start = parseInt(ol.getAttribute('data-ol-start') || '1', 10);
      const presetId = ol.getAttribute('data-ol-preset');
      const color = ol.getAttribute('data-ol-color');
      const preset = window.PRESETS.ol.find(p => p.id === presetId) || window.PRESETS.ol[0];
      let i = start - 1;
      ol.querySelectorAll(':scope > li').forEach(li => {
        i++;
        let labelText;
        if (preset.format === 'circled') labelText = toCircled(i);
        else if (preset.format === 'chinese') labelText = toChinese(i);
        else if (preset.format === 'square') labelText = String(i);
        else labelText = preset.format.replace('{n}', i);

        const span = document.createElement('span');
        const styleStr = preset.style.replace(/\{c\}/g, color);
        span.setAttribute('style', styleStr + ' flex-shrink:0; min-width:1.8em; text-align:left; line-height:inherit;');
        span.textContent = labelText;
        const walker = document.createNodeIterator(li, NodeFilter.SHOW_COMMENT);
        let n;
        while ((n = walker.nextNode())) {
          if (n.nodeValue === 'LI_MARKER_PLACEHOLDER') {
            n.parentNode.replaceChild(span, n);
            break;
          }
        }
      });
    });

    // 清理 data-* 属性
    tpl.querySelectorAll('[data-ul-marker], [data-ul-color], [data-ol-start], [data-ol-preset], [data-ol-color]').forEach(el => {
      el.removeAttribute('data-ul-marker');
      el.removeAttribute('data-ul-color');
      el.removeAttribute('data-ol-start');
      el.removeAttribute('data-ol-preset');
      el.removeAttribute('data-ol-color');
    });

    return tpl.innerHTML;
  }

  // ============ 对外主渲染函数 ============
  window.renderMarkdown = function (md, settings) {
    marked.setOptions({
      gfm: true,
      breaks: false,
      smartypants: false,
    });
    const renderer = makeRenderer(settings);
    let html = marked.parse(md, { renderer });
    html = applyListMarkers(html);

    // 包裹一层外容器
    const g = settings.global;
    const fontFamily = (P.global.fontFamily.find(f => f.id === g.fontFamily) || P.global.fontFamily[0]).value;
    const mw = (g.maxWidth != null && g.maxWidth !== '') ? `max-width:${g.maxWidth}px;margin:0 auto;` : '';
    const wrapperStyle = `color:${g.ink}; background:${g.bg || 'transparent'}; font-family:${fontFamily}; font-size:${settings.p.fontSize}px; line-height:${settings.p.lineHeight}; max-width:100%; word-wrap:break-word; overflow-wrap:break-word; padding:0;${mw}`;
    return `<section style="${wrapperStyle}">${html}</section>`;
  };

})();

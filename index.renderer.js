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

  // ============ SVG 装饰片段 ============
  // 每个 key 返回一段 HTML（通常是 <svg>），接收 {c} 主色、{cbg} 柔色
  const SVG_DECO = {
    // ── H1 ──
    'ribbon': (c) => `<span style="display:block;position:absolute;left:-8px;top:0;bottom:0;width:8px;"><svg width="8" height="100%" viewBox="0 0 8 40" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><polygon points="0,0 8,0 8,40 0,40 4,34" fill="${c}" opacity="0.6"/></svg></span><span style="display:block;position:absolute;right:-8px;top:0;bottom:0;width:8px;"><svg width="8" height="100%" viewBox="0 0 8 40" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><polygon points="0,0 8,0 4,34 8,40 0,40" fill="${c}" opacity="0.6"/></svg></span>`,
    'gradbar': (c) => `<span style="position:absolute;left:0;top:2px;bottom:2px;width:5px;border-radius:3px;overflow:hidden;"><svg width="5" height="100%" viewBox="0 0 5 40" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="gb" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${c}"/><stop offset="100%" stop-color="${c}" stop-opacity="0.3"/></linearGradient></defs><rect width="5" height="40" fill="url(#gb)"/></svg></span>`,
    'dots': (c, cbg) => `<span style="position:absolute;left:0;top:0;right:0;bottom:0;overflow:hidden;pointer-events:none;opacity:0.15;border-radius:8px;"><svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="dp" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="${c}"/></pattern></defs><rect width="100%" height="100%" fill="url(#dp)"/></svg></span>`,
    'flower-top': (c) => `<span style="display:block;text-align:center;margin-bottom:4px;"><svg width="120" height="16" viewBox="0 0 120 16" xmlns="http://www.w3.org/2000/svg"><path d="M10 8 Q20 0 30 8 Q40 16 50 8 Q60 0 70 8 Q80 16 90 8 Q100 0 110 8" stroke="${c}" stroke-width="1.5" fill="none" opacity="0.5"/><circle cx="10" cy="8" r="2.5" fill="${c}" opacity="0.6"/><circle cx="60" cy="8" r="2.5" fill="${c}" opacity="0.6"/><circle cx="110" cy="8" r="2.5" fill="${c}" opacity="0.6"/></svg></span>`,
    'flower-bottom': (c) => `<span style="display:block;text-align:center;margin-top:4px;"><svg width="120" height="16" viewBox="0 0 120 16" xmlns="http://www.w3.org/2000/svg"><path d="M10 8 Q20 16 30 8 Q40 0 50 8 Q60 16 70 8 Q80 0 90 8 Q100 16 110 8" stroke="${c}" stroke-width="1.5" fill="none" opacity="0.5"/><circle cx="10" cy="8" r="2.5" fill="${c}" opacity="0.6"/><circle cx="60" cy="8" r="2.5" fill="${c}" opacity="0.6"/><circle cx="110" cy="8" r="2.5" fill="${c}" opacity="0.6"/></svg></span>`,
    'frame': (c) => `<span style="position:absolute;inset:0;pointer-events:none;"><svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="position:absolute;inset:0;"><rect x="4" y="4" width="calc(100% - 8px)" height="calc(100% - 8px)" rx="4" fill="none" stroke="${c}" stroke-width="1" opacity="0.3" stroke-dasharray="6 3"/><rect x="0" y="0" width="10" height="10" fill="${c}" opacity="0.15"/><rect x="calc(100% - 10px)" y="0" width="10" height="10" fill="${c}" opacity="0.15"/><rect x="0" y="calc(100% - 10px)" width="10" height="10" fill="${c}" opacity="0.15"/><rect x="calc(100% - 10px)" y="calc(100% - 10px)" width="10" height="10" fill="${c}" opacity="0.15"/></svg></span>`,
    'gradient-fill': (c) => ``,
    'pen-underline': (c) => `<span style="display:block;text-align:center;"><svg width="140" height="12" viewBox="0 0 140 12" xmlns="http://www.w3.org/2000/svg"><path d="M4 6 Q30 2 70 6 Q110 10 136 6" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.6"/><line x1="126" y1="2" x2="136" y2="10" stroke="${c}" stroke-width="1.5" opacity="0.4"/></svg></span>`,
    'corner-l': (c) => `<span style="position:absolute;inset:0;pointer-events:none;"><svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="position:absolute;inset:0;"><path d="M2 28 L2 2 L28 2" stroke="${c}" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="Mcalc(100% - 28px) calc(100% - 2px) Lcalc(100% - 2px) calc(100% - 2px) Lcalc(100% - 2px) calc(100% - 28px)" stroke="${c}" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg></span>`,
    // ── H2 ──
    'icon-tag': (c) => `<svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;"><path d="M3 2h5l7 7-7 7H3V2z" fill="${c}" opacity="0.15"/><path d="M3 2h5l7 7-7 7H3V2z" fill="none" stroke="${c}" stroke-width="1.2" stroke-linejoin="round"/></svg>`,
    'zebra-line': (c) => `<span style="display:block;"><svg width="100%" height="6" viewBox="0 0 200 6" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><line x1="0" y1="1" x2="40" y2="1" stroke="${c}" stroke-width="2.5" stroke-linecap="round"/><line x1="44" y1="1" x2="54" y2="1" stroke="${c}" stroke-width="2.5" stroke-linecap="round" opacity="0.5"/><line x1="58" y1="1" x2="66" y2="1" stroke="${c}" stroke-width="2.5" stroke-linecap="round" opacity="0.25"/></svg></span>`,
    'badge-bg': (c, cbg) => `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;"><rect width="24" height="24" rx="6" fill="${c}"/><path d="M7 12l3 3 7-7" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    'arrow-right': (c) => `<svg width="22" height="18" viewBox="0 0 22 18" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;"><path d="M2 9h14M12 4l5 5-5 5" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    'signal-dots': (c) => `<svg width="20" height="14" viewBox="0 0 20 14" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;"><circle cx="4" cy="10" r="3" fill="${c}"/><circle cx="10" cy="7" r="3" fill="${c}" opacity="0.6"/><circle cx="16" cy="4" r="3" fill="${c}" opacity="0.3"/></svg>`,
    // ── H3 ──
    'squiggle': (c) => `<span style="display:block;"><svg width="100%" height="5" viewBox="0 0 120 5" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 2.5 Q5 0 10 2.5 T20 2.5 T30 2.5 T40 2.5 T50 2.5 T60 2.5 T70 2.5 T80 2.5 T90 2.5 T100 2.5 T110 2.5 T120 2.5" stroke="${c}" stroke-width="1.8" fill="none" opacity="0.5"/></svg></span>`,
    'mini-tag': (c, cbg) => `<svg width="14" height="18" viewBox="0 0 14 18" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;"><path d="M0 0h10l4 4v14H0V0z" fill="${cbg}"/><path d="M0 0h10l4 4v14H0V0z" fill="none" stroke="${c}" stroke-width="1"/><path d="M10 0v4h4" fill="none" stroke="${c}" stroke-width="0.8" opacity="0.5"/></svg>`,
    'check-mark': (c) => `<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;"><circle cx="8" cy="8" r="7" fill="${c}" opacity="0.15"/><path d="M5 8l2 2 4-4" stroke="${c}" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    'bookmark-corner': (c, cbg) => `<span style="position:absolute;top:0;left:0;width:16px;height:16px;overflow:hidden;"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h16v16L8 11 0 16V0z" fill="${c}" opacity="0.2"/></svg></span>`,
    'zigzag': (c) => `<span style="display:block;"><svg width="100%" height="5" viewBox="0 0 120 5" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 3 L6 1 L12 3 L18 1 L24 3 L30 1 L36 3 L42 1 L48 3 L54 1 L60 3 L66 1 L72 3 L78 1 L84 3 L90 1 L96 3 L102 1 L108 3 L114 1 L120 3" stroke="${c}" stroke-width="1.5" fill="none" opacity="0.4"/></svg></span>`,
    // ── H4 ──
    'mini-dot': (c) => `<svg width="8" height="8" viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;"><circle cx="4" cy="4" r="3" fill="${c}"/></svg>`,
    'pin': (c) => `<svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;"><path d="M7 1C4.8 1 3 2.8 3 5c0 3 4 8 4 8s4-5 4-8c0-2.2-1.8-4-4-4z" fill="${c}" opacity="0.7"/><circle cx="7" cy="5" r="1.5" fill="#fff"/></svg>`,
    'gt-sign': (c) => `<svg width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;"><path d="M2 1l5 5-5 5" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

    // ── 新增 H1 装饰 ──
    'diamond-line': (c) => `<span style="display:block;text-align:center;"><svg width="140" height="10" viewBox="0 0 140 10" xmlns="http://www.w3.org/2000/svg"><line x1="0" y1="5" x2="55" y2="5" stroke="${c}" stroke-width="1" opacity="0.4"/><polygon points="70,1 79,5 70,9 61,5" fill="${c}" opacity="0.5"/><line x1="85" y1="5" x2="140" y2="5" stroke="${c}" stroke-width="1" opacity="0.4"/></svg></span>`,
    'crown': (c) => `<span style="display:block;text-align:center;margin-bottom:2px;"><svg width="60" height="14" viewBox="0 0 60 14" xmlns="http://www.w3.org/2000/svg"><path d="M4 12 L12 4 L20 10 L30 2 L40 10 L48 4 L56 12" stroke="${c}" stroke-width="1.5" fill="none" stroke-linejoin="round" opacity="0.5"/><circle cx="30" cy="2" r="2" fill="${c}" opacity="0.6"/></svg></span>`,
    'glow-bar': (c) => `<span style="position:absolute;left:0;top:4px;bottom:4px;width:4px;border-radius:2px;"><svg width="4" height="100%" viewBox="0 0 4 40" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><defs><filter id="gl"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect width="4" height="40" fill="${c}" rx="2" filter="url(#gl)"/></svg></span>`,
    'brackets-line': (c) => `<span style="display:block;text-align:center;"><svg width="120" height="10" viewBox="0 0 120 10" xmlns="http://www.w3.org/2000/svg"><line x1="0" y1="5" x2="40" y2="5" stroke="${c}" stroke-width="1" opacity="0.3"/><path d="M44 2 L50 5 L44 8" stroke="${c}" stroke-width="1.2" fill="none" opacity="0.5"/><circle cx="60" cy="5" r="2" fill="${c}" opacity="0.4"/><path d="M76 2 L70 5 L76 8" stroke="${c}" stroke-width="1.2" fill="none" opacity="0.5"/><line x1="80" y1="5" x2="120" y2="5" stroke="${c}" stroke-width="1" opacity="0.3"/></svg></span>`,
    'starburst': (c) => `<span style="display:block;text-align:center;margin-bottom:4px;"><svg width="40" height="16" viewBox="0 0 40 16" xmlns="http://www.w3.org/2000/svg"><path d="M20 0 L22 6 L28 4 L24 8 L32 8 L26 12 L28 16 L20 12 L12 16 L14 12 L8 8 L16 8 L12 4 L18 6 Z" fill="${c}" opacity="0.2"/></svg></span>`,
    'double-diamond': (c) => `<span style="display:block;text-align:center;margin-bottom:2px;"><svg width="50" height="10" viewBox="0 0 50 10" xmlns="http://www.w3.org/2000/svg"><polygon points="10,0 20,5 10,10 0,5" fill="${c}" opacity="0.25"/><polygon points="30,0 40,5 30,10 20,5" fill="${c}" opacity="0.35"/><polygon points="40,0 50,5 40,10 30,5" fill="none" stroke="${c}" stroke-width="0.8" opacity="0.3"/></svg></span>`,

    // ── 新增 H2 装饰 ──
    'lightning': (c) => `<svg width="16" height="18" viewBox="0 0 16 18" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;"><path d="M9 1L3 10h4l-1 7 7-9H9l1-7z" fill="${c}" opacity="0.7"/></svg>`,
    'hexagon': (c) => `<svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;"><path d="M9 1L16 5V13L9 17L2 13V5Z" fill="${c}" opacity="0.15"/><path d="M9 1L16 5V13L9 17L2 13V5Z" fill="none" stroke="${c}" stroke-width="1.2"/></svg>`,
    'terminal-cursor': (c) => `<svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;"><path d="M2 5l5 4-5 4" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><line x1="10" y1="13" x2="16" y2="13" stroke="${c}" stroke-width="2" stroke-linecap="round"/></svg>`,
    'shield': (c) => `<svg width="16" height="18" viewBox="0 0 16 18" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;"><path d="M8 1L1 4v5c0 4 3.5 7 7 8 3.5-1 7-4 7-8V4L8 1z" fill="${c}" opacity="0.12"/><path d="M8 1L1 4v5c0 4 3.5 7 7 8 3.5-1 7-4 7-8V4L8 1z" fill="none" stroke="${c}" stroke-width="1.2"/></svg>`,
    'rocket': (c) => `<svg width="16" height="18" viewBox="0 0 16 18" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;"><path d="M8 1C6 4 4 7 4 10l-2 2h3c0 2 1 3 3 4 2-1 3-2 3-4h3l-2-2c0-3-2-6-4-9z" fill="${c}" opacity="0.15"/><path d="M8 1C6 4 4 7 4 10l-2 2h3c0 2 1 3 3 4 2-1 3-2 3-4h3l-2-2c0-3-2-6-4-9z" fill="none" stroke="${c}" stroke-width="1"/></svg>`,
    'neon-line': (c) => `<span style="display:block;"><svg width="100%" height="4" viewBox="0 0 200 4" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><defs><filter id="nl"><feGaussianBlur stdDeviation="1" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><line x1="0" y1="2" x2="200" y2="2" stroke="${c}" stroke-width="2" filter="url(#nl)" opacity="0.7"/></svg></span>`,
    'sparkle-line': (c) => `<span style="display:block;"><svg width="100%" height="6" viewBox="0 0 200 6" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><line x1="0" y1="3" x2="200" y2="3" stroke="${c}" stroke-width="1.5" opacity="0.3"/><circle cx="20" cy="3" r="2" fill="${c}" opacity="0.6"/><circle cx="80" cy="3" r="1.5" fill="${c}" opacity="0.4"/><circle cx="140" cy="3" r="2" fill="${c}" opacity="0.5"/></svg></span>`,

    // ── 新增 H3 装饰 ──
    'sparkle': (c) => `<svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;"><path d="M7 0L8 5L13 4L9 7L13 10L8 9L7 14L6 9L1 10L5 7L1 4L6 5Z" fill="${c}" opacity="0.6"/></svg>`,
    'eye': (c) => `<svg width="16" height="12" viewBox="0 0 16 12" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;"><ellipse cx="8" cy="6" rx="7" ry="5" fill="none" stroke="${c}" stroke-width="1.2" opacity="0.5"/><circle cx="8" cy="6" r="2.5" fill="${c}" opacity="0.5"/></svg>`,
    'cross': (c) => `<svg width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;"><line x1="2" y1="2" x2="10" y2="10" stroke="${c}" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/><line x1="10" y1="2" x2="2" y2="10" stroke="${c}" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/></svg>`,
    'dash-wave': (c) => `<span style="display:block;"><svg width="100%" height="4" viewBox="0 0 120 4" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 2 Q10 0 20 2 T40 2 T60 2 T80 2 T100 2 T120 2" stroke="${c}" stroke-width="1.2" fill="none" stroke-dasharray="4 3" opacity="0.5"/></svg></span>`,
    'dot-trail': (c) => `<span style="display:block;"><svg width="100%" height="8" viewBox="0 0 120 8" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><line x1="0" y1="4" x2="42" y2="4" stroke="${c}" stroke-width="1.4" stroke-linecap="round" opacity="0.42"/><circle cx="56" cy="4" r="2.1" fill="${c}" opacity="0.58"/><circle cx="72" cy="4" r="1.6" fill="${c}" opacity="0.4"/><circle cx="86" cy="4" r="1.15" fill="${c}" opacity="0.26"/></svg></span>`,
    'bracket-mark': (c) => `<svg width="10" height="14" viewBox="0 0 10 14" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;"><path d="M8 1L2 7L8 13" stroke="${c}" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

    // ── 新增 H4 装饰 ──
    'hash-mark': (c) => `<svg width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;"><line x1="4" y1="1" x2="4" y2="11" stroke="${c}" stroke-width="1.5" opacity="0.5"/><line x1="8" y1="1" x2="8" y2="11" stroke="${c}" stroke-width="1.5" opacity="0.5"/><line x1="1" y1="4" x2="11" y2="4" stroke="${c}" stroke-width="1.5" opacity="0.5"/><line x1="1" y1="8" x2="11" y2="8" stroke="${c}" stroke-width="1.5" opacity="0.5"/></svg>`,
    'square-dot': (c) => `<svg width="10" height="10" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;"><rect x="1" y="1" width="8" height="8" rx="1.5" fill="none" stroke="${c}" stroke-width="1.2" opacity="0.5"/><circle cx="5" cy="5" r="2" fill="${c}" opacity="0.5"/></svg>`,
    'tilde': (c) => `<svg width="12" height="8" viewBox="0 0 12 8" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;"><path d="M1 4 Q3 1 6 4 Q9 7 11 4" stroke="${c}" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.6"/></svg>`,
    'ring-dot': (c) => `<svg width="10" height="10" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;"><circle cx="5" cy="5" r="4" fill="none" stroke="${c}" stroke-width="1.2" opacity="0.5"/><circle cx="5" cy="5" r="1.5" fill="${c}" opacity="0.6"/></svg>`,

    // ── 春意主题专用 ──
    'leaf-branch': (c) => `<span style="display:block;text-align:center;margin-bottom:6px;"><svg width="160" height="24" viewBox="0 0 160 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 20 Q40 8 80 12 Q120 16 140 4" stroke="${c}" stroke-width="1.5" fill="none" opacity="0.45"/><ellipse cx="38" cy="12" rx="6" ry="3.5" transform="rotate(-30 38 12)" fill="${c}" opacity="0.2"/><ellipse cx="56" cy="10" rx="5" ry="3" transform="rotate(-20 56 10)" fill="${c}" opacity="0.15"/><ellipse cx="74" cy="11" rx="6" ry="3.5" transform="rotate(10 74 11)" fill="${c}" opacity="0.2"/><ellipse cx="92" cy="13" rx="5" ry="3" transform="rotate(15 92 13)" fill="${c}" opacity="0.15"/><ellipse cx="112" cy="12" rx="6" ry="3.5" transform="rotate(-10 112 12)" fill="${c}" opacity="0.2"/><circle cx="20" cy="20" r="2" fill="${c}" opacity="0.3"/><circle cx="140" cy="4" r="2" fill="${c}" opacity="0.3"/></svg></span>`,
    'leaf-underline': (c) => `<span style="display:block;text-align:center;margin-top:2px;"><svg width="140" height="12" viewBox="0 0 140 12" xmlns="http://www.w3.org/2000/svg"><path d="M10 6 Q35 3 70 6 Q105 9 130 4" stroke="${c}" stroke-width="1.2" fill="none" opacity="0.4"/><ellipse cx="50" cy="5" rx="4" ry="2.5" transform="rotate(-15 50 5)" fill="${c}" opacity="0.15"/><ellipse cx="90" cy="6" rx="4" ry="2.5" transform="rotate(10 90 6)" fill="${c}" opacity="0.15"/></svg></span>`,
    'leaf-icon': (c) => `<svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;"><path d="M9 2C5 6 3 10 3 13c0 0 3 1 6-2 3-3 6-9 6-9S12 2 9 2z" fill="${c}" opacity="0.15"/><path d="M9 2C5 6 3 10 3 13c0 0 3 1 6-2 3-3 6-9 6-9S12 2 9 2z" fill="none" stroke="${c}" stroke-width="1.2"/><path d="M9 4v8" stroke="${c}" stroke-width="0.8" opacity="0.5"/><path d="M7 8 Q9 6 11 8" stroke="${c}" stroke-width="0.6" fill="none" opacity="0.4"/></svg>`,

    // ── 春意柳条题图 ──
    'willow-banner': (c, cbg) => `<span style="display:block;border-radius:8px;overflow:hidden;"><svg width="100%" height="120" viewBox="0 0 400 120" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="wbg" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0%" stop-color="#E8F5E0"/><stop offset="100%" stop-color="${cbg}"/></linearGradient></defs><rect width="400" height="120" fill="url(#wbg)"/><path d="M45,-5 Q52,35 38,70 Q30,95 45,130" stroke="#7A6B52" stroke-width="1.5" fill="none" opacity="0.28"/><path d="M155,-5 Q148,30 162,60 Q170,82 155,130" stroke="#7A6B52" stroke-width="1.3" fill="none" opacity="0.24"/><path d="M280,-5 Q288,25 275,55 Q268,78 282,130" stroke="#7A6B52" stroke-width="1.4" fill="none" opacity="0.26"/><path d="M375,-5 Q368,32 380,65 Q386,85 372,130" stroke="#7A6B52" stroke-width="1.2" fill="none" opacity="0.2"/><path d="M46,18 Q38,32 33,42" stroke="${c}" stroke-width="0.7" fill="none" opacity="0.35"/><ellipse cx="32" cy="44" rx="1.8" ry="5.5" fill="${c}" opacity="0.2" transform="rotate(18,32,44)"/><path d="M43,32 Q35,48 30,58" stroke="${c}" stroke-width="0.7" fill="none" opacity="0.3"/><ellipse cx="29" cy="60" rx="1.8" ry="6" fill="${c}" opacity="0.17" transform="rotate(12,29,60)"/><path d="M41,48 Q34,62 28,75" stroke="${c}" stroke-width="0.7" fill="none" opacity="0.25"/><ellipse cx="27" cy="77" rx="1.8" ry="6" fill="${c}" opacity="0.14" transform="rotate(6,27,77)"/><path d="M39,65 Q32,80 27,95" stroke="${c}" stroke-width="0.7" fill="none" opacity="0.2"/><ellipse cx="26" cy="97" rx="1.8" ry="5.5" fill="${c}" opacity="0.11" transform="rotate(0,26,97)"/><path d="M156,15 Q148,28 143,36" stroke="${c}" stroke-width="0.7" fill="none" opacity="0.32"/><ellipse cx="142" cy="38" rx="1.6" ry="5" fill="${c}" opacity="0.18" transform="rotate(-16,142,38)"/><path d="M158,30 Q150,45 145,55" stroke="${c}" stroke-width="0.7" fill="none" opacity="0.28"/><ellipse cx="144" cy="57" rx="1.6" ry="5.5" fill="${c}" opacity="0.15" transform="rotate(-10,144,57)"/><path d="M160,48 Q152,62 147,75" stroke="${c}" stroke-width="0.7" fill="none" opacity="0.22"/><ellipse cx="146" cy="77" rx="1.6" ry="5.5" fill="${c}" opacity="0.12" transform="rotate(-5,146,77)"/><path d="M158,65 Q150,80 146,95" stroke="${c}" stroke-width="0.7" fill="none" opacity="0.18"/><ellipse cx="145" cy="97" rx="1.6" ry="5" fill="${c}" opacity="0.1" transform="rotate(0,145,97)"/><path d="M278,18 Q286,32 290,42" stroke="${c}" stroke-width="0.7" fill="none" opacity="0.33"/><ellipse cx="291" cy="44" rx="1.7" ry="5.5" fill="${c}" opacity="0.19" transform="rotate(-18,291,44)"/><path d="M277,35 Q284,48 288,58" stroke="${c}" stroke-width="0.7" fill="none" opacity="0.28"/><ellipse cx="289" cy="60" rx="1.7" ry="6" fill="${c}" opacity="0.16" transform="rotate(-12,289,60)"/><path d="M279,50 Q286,64 290,76" stroke="${c}" stroke-width="0.7" fill="none" opacity="0.22"/><ellipse cx="291" cy="78" rx="1.7" ry="5.5" fill="${c}" opacity="0.13" transform="rotate(-6,291,78)"/><path d="M280,68 Q286,82 290,95" stroke="${c}" stroke-width="0.7" fill="none" opacity="0.17"/><ellipse cx="291" cy="97" rx="1.7" ry="5" fill="${c}" opacity="0.1" transform="rotate(0,291,97)"/><path d="M374,20 Q368,32 364,40" stroke="${c}" stroke-width="0.7" fill="none" opacity="0.3"/><ellipse cx="363" cy="42" rx="1.5" ry="5" fill="${c}" opacity="0.17" transform="rotate(20,363,42)"/><path d="M376,36 Q370,48 366,56" stroke="${c}" stroke-width="0.7" fill="none" opacity="0.25"/><ellipse cx="365" cy="58" rx="1.5" ry="5.5" fill="${c}" opacity="0.14" transform="rotate(14,365,58)"/><path d="M378,52 Q372,65 368,75" stroke="${c}" stroke-width="0.7" fill="none" opacity="0.2"/><ellipse cx="367" cy="77" rx="1.5" ry="5" fill="${c}" opacity="0.11" transform="rotate(8,367,77)"/><ellipse cx="100" cy="16" rx="1.5" ry="5" fill="${c}" opacity="0.14" transform="rotate(35,100,16)"/><ellipse cx="220" cy="12" rx="1.5" ry="4.5" fill="${c}" opacity="0.11" transform="rotate(-25,220,12)"/><ellipse cx="340" cy="18" rx="1.5" ry="5" fill="${c}" opacity="0.13" transform="rotate(40,340,18)"/><ellipse cx="195" cy="100" rx="1.5" ry="5" fill="${c}" opacity="0.09" transform="rotate(-30,195,100)"/><ellipse cx="75" cy="108" rx="1.5" ry="4.5" fill="${c}" opacity="0.07" transform="rotate(50,75,108)"/></svg></span>`,

    // ── 樱花主题专用 ──
    'sakura-top': (c) => `<span style="display:block;text-align:center;margin-bottom:6px;"><svg width="140" height="28" viewBox="0 0 140 28" xmlns="http://www.w3.org/2000/svg"><circle cx="28" cy="10" r="5" fill="${c}" opacity="0.12"/><circle cx="28" cy="10" r="3" fill="${c}" opacity="0.08"/><circle cx="46" cy="16" r="4" fill="${c}" opacity="0.1"/><circle cx="70" cy="8" r="6" fill="${c}" opacity="0.15"/><circle cx="70" cy="8" r="3.5" fill="${c}" opacity="0.1"/><circle cx="94" cy="14" r="4.5" fill="${c}" opacity="0.12"/><circle cx="112" cy="8" r="5" fill="${c}" opacity="0.1"/><line x1="20" y1="22" x2="120" y2="22" stroke="${c}" stroke-width="0.6" opacity="0.25"/><circle cx="20" cy="22" r="1.5" fill="${c}" opacity="0.2"/><circle cx="120" cy="22" r="1.5" fill="${c}" opacity="0.2"/></svg></span>`,
    'sakura-bottom': (c) => `<span style="display:block;text-align:center;margin-top:4px;"><svg width="120" height="14" viewBox="0 0 120 14" xmlns="http://www.w3.org/2000/svg"><path d="M10 7 Q30 3 60 7 Q90 11 110 5" stroke="${c}" stroke-width="1" fill="none" opacity="0.35"/><circle cx="35" cy="6" r="2.5" fill="${c}" opacity="0.1"/><circle cx="85" cy="7" r="2.5" fill="${c}" opacity="0.1"/></svg></span>`,
    'sakura-icon': (c) => `<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;"><circle cx="10" cy="5" r="3.2" fill="${c}" opacity="0.13"/><circle cx="14.5" cy="8.5" r="3.2" fill="${c}" opacity="0.13"/><circle cx="13" cy="14" r="3.2" fill="${c}" opacity="0.13"/><circle cx="7" cy="14" r="3.2" fill="${c}" opacity="0.13"/><circle cx="5.5" cy="8.5" r="3.2" fill="${c}" opacity="0.13"/><circle cx="10" cy="10" r="2" fill="${c}" opacity="0.3"/></svg>`,
    'sakura-line': (c) => `<span style="display:block;"><svg width="100%" height="6" viewBox="0 0 200 6" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><line x1="0" y1="3" x2="200" y2="3" stroke="${c}" stroke-width="1.2" opacity="0.3"/><circle cx="30" cy="3" r="2" fill="${c}" opacity="0.4"/><circle cx="100" cy="3" r="2.5" fill="${c}" opacity="0.5"/><circle cx="170" cy="3" r="2" fill="${c}" opacity="0.4"/></svg></span>`,
    'sakura-banner': (c, cbg) => `<span style="position:absolute;left:0;right:0;top:0;bottom:0;pointer-events:none;z-index:-1;"><svg width="100%" height="100%" viewBox="0 0 400 120" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="skb" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0%" stop-color="#FFE8EE"/><stop offset="100%" stop-color="${cbg}"/></linearGradient></defs><rect width="400" height="120" fill="url(#skb)"/><path d="M-5 95 Q60 50 150 65 Q250 80 340 40 L405 15" stroke="#C09080" stroke-width="1.2" fill="none" opacity="0.2"/><g transform="translate(65,40)" opacity="0.55"><path d="M0,-10 C5,-8 6,-2 0,0 C-6,-2 -5,-8 0,-10" fill="${c}" opacity="0.5"/><path d="M0,-10 C5,-8 6,-2 0,0 C-6,-2 -5,-8 0,-10" fill="${c}" opacity="0.5" transform="rotate(72)"/><path d="M0,-10 C5,-8 6,-2 0,0 C-6,-2 -5,-8 0,-10" fill="${c}" opacity="0.5" transform="rotate(144)"/><path d="M0,-10 C5,-8 6,-2 0,0 C-6,-2 -5,-8 0,-10" fill="${c}" opacity="0.5" transform="rotate(216)"/><path d="M0,-10 C5,-8 6,-2 0,0 C-6,-2 -5,-8 0,-10" fill="${c}" opacity="0.5" transform="rotate(288)"/><circle r="3" fill="#fff" opacity="0.5"/></g><g transform="translate(160,58)" opacity="0.45"><path d="M0,-7 C3.5,-5.5 4.5,-1.5 0,0 C-4.5,-1.5 -3.5,-5.5 0,-7" fill="${c}" opacity="0.5"/><path d="M0,-7 C3.5,-5.5 4.5,-1.5 0,0 C-4.5,-1.5 -3.5,-5.5 0,-7" fill="${c}" opacity="0.5" transform="rotate(72)"/><path d="M0,-7 C3.5,-5.5 4.5,-1.5 0,0 C-4.5,-1.5 -3.5,-5.5 0,-7" fill="${c}" opacity="0.5" transform="rotate(144)"/><path d="M0,-7 C3.5,-5.5 4.5,-1.5 0,0 C-4.5,-1.5 -3.5,-5.5 0,-7" fill="${c}" opacity="0.5" transform="rotate(216)"/><path d="M0,-7 C3.5,-5.5 4.5,-1.5 0,0 C-4.5,-1.5 -3.5,-5.5 0,-7" fill="${c}" opacity="0.5" transform="rotate(288)"/><circle r="2.5" fill="#fff" opacity="0.45"/></g><g transform="translate(300,32)" opacity="0.5"><path d="M0,-8 C4,-6 5,-1.5 0,0 C-5,-1.5 -4,-6 0,-8" fill="${c}" opacity="0.55"/><path d="M0,-8 C4,-6 5,-1.5 0,0 C-5,-1.5 -4,-6 0,-8" fill="${c}" opacity="0.55" transform="rotate(72)"/><path d="M0,-8 C4,-6 5,-1.5 0,0 C-5,-1.5 -4,-6 0,-8" fill="${c}" opacity="0.55" transform="rotate(144)"/><path d="M0,-8 C4,-6 5,-1.5 0,0 C-5,-1.5 -4,-6 0,-8" fill="${c}" opacity="0.55" transform="rotate(216)"/><path d="M0,-8 C4,-6 5,-1.5 0,0 C-5,-1.5 -4,-6 0,-8" fill="${c}" opacity="0.55" transform="rotate(288)"/><circle r="2.8" fill="#fff" opacity="0.5"/></g><g transform="translate(370,50)" opacity="0.35"><path d="M0,-6 C3,-4.5 3.8,-1 0,0 C-3.8,-1 -3,-4.5 0,-6" fill="${c}" opacity="0.45"/><path d="M0,-6 C3,-4.5 3.8,-1 0,0 C-3.8,-1 -3,-4.5 0,-6" fill="${c}" opacity="0.45" transform="rotate(72)"/><path d="M0,-6 C3,-4.5 3.8,-1 0,0 C-3.8,-1 -3,-4.5 0,-6" fill="${c}" opacity="0.45" transform="rotate(144)"/><path d="M0,-6 C3,-4.5 3.8,-1 0,0 C-3.8,-1 -3,-4.5 0,-6" fill="${c}" opacity="0.45" transform="rotate(216)"/><path d="M0,-6 C3,-4.5 3.8,-1 0,0 C-3.8,-1 -3,-4.5 0,-6" fill="${c}" opacity="0.45" transform="rotate(288)"/><circle r="2" fill="#fff" opacity="0.4"/></g><ellipse cx="110" cy="22" rx="3" ry="5" fill="${c}" opacity="0.18" transform="rotate(30,110,22)"/><ellipse cx="230" cy="40" rx="2.5" ry="4" fill="${c}" opacity="0.15" transform="rotate(-25,230,40)"/><ellipse cx="350" cy="68" rx="3" ry="4.5" fill="${c}" opacity="0.2" transform="rotate(45,350,68)"/><ellipse cx="45" cy="72" rx="2" ry="3.5" fill="${c}" opacity="0.15" transform="rotate(60,45,72)"/></svg></span>`,
  };

  function svgDecor(type, c, cbg) {
    const fn = SVG_DECO[type];
    return fn ? fn(c, cbg) : '';
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

  function buildCustomHeadingPrefix(level, cfg) {
    if ((level !== 2 && level !== 3 && level !== 4) || !cfg || !cfg.customPrefix) return '';
    const prefix = escapeHtmlText(String(cfg.customPrefix));
    if (!prefix) return '';
    return `<span style="display:inline-block;margin-right:0.35em;">${prefix}</span>`;
  }

  function buildParagraph(cfg) {
    const preset = find(P.p, cfg.preset);
    const fw = cfg.fontWeight || 400;
    const vars = {
      fs: cfg.fontSize,
      c: cfg.color,
      lh: cfg.lineHeight,
      ls: cfg.letterSpacing,
    };
    let style = fillStyle(preset.style, vars) + `;font-weight:${fw}`;
    if (cfg.inkBlur) style += ';text-shadow:0 1px 2px rgba(0,0,0,0.2)';
    return style;
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
      const c = cfg.color;
      const cbg = settings.global.brandSoft;
      const customPrefix = buildCustomHeadingPrefix(lvl, cfg);

      if (preset.prefix) content = preset.prefix + content;
      if (preset.suffix) content = content + preset.suffix;
      if (customPrefix) content = customPrefix + content;

      if (preset.badge) {
        const badgeStyle = `display:inline-flex; align-items:center; justify-content:center; min-width:30px; height:30px; border-radius:50%; background:${cfg.color}; color:#fff; font-size:15px; font-weight:700; flex-shrink:0;`;
        if (!renderer._hCount) renderer._hCount = {};
        renderer._hCount[lvl] = (renderer._hCount[lvl] || 0) + 1;
        return `<h${lvl} style="${style}"><span style="${badgeStyle}">${renderer._hCount[lvl]}</span><span>${content}</span></h${lvl}>`;
      }
      if (preset.badgeSq) {
        const badgeStyle = `display:inline-flex; align-items:center; justify-content:center; min-width:24px; height:24px; border-radius:4px; background:${cfg.color}; color:#fff; font-size:13px; font-weight:700; flex-shrink:0;`;
        if (!renderer._hCount) renderer._hCount = {};
        renderer._hCount[lvl] = (renderer._hCount[lvl] || 0) + 1;
        return `<h${lvl} style="${style}"><span style="${badgeStyle}">${renderer._hCount[lvl]}</span><span>${content}</span></h${lvl}>`;
      }
      if (preset.numPrefix) {
        if (!renderer._hCount) renderer._hCount = {};
        renderer._hCount[lvl] = (renderer._hCount[lvl] || 0) + 1;
        const n = renderer._hCount[lvl];
        return `<h${lvl} style="${style}"><span style="color:${cfg.color}; margin-right:8px; font-family:Georgia,serif;">${String(n).padStart(2,'0')}</span>${content}</h${lvl}>`;
      }

      // SVG 装饰
      const before = preset.svgBefore ? svgDecor(preset.svgBefore, c, cbg) : '';
      const after = preset.svgAfter ? svgDecor(preset.svgAfter, c, cbg) : '';

      // 特殊处理：gradient-fill 需要注入背景渐变
      let finalStyle = style;
      if (preset.svgBefore === 'gradient-fill') {
        finalStyle = style.replace('border-radius:10px;', `border-radius:10px; background:linear-gradient(135deg, ${c}, ${cbg});`);
      }

      // 特殊处理：banner 类装饰将 SVG 作为 background-image（文字自然在上层）
      if (preset.svgBefore === 'sakura-banner' || preset.svgBefore === 'willow-banner') {
        const svgMatch = before.match(/<svg[\s\S]*?<\/svg>/);
        if (svgMatch) {
          const encoded = encodeURIComponent(svgMatch[0]);
          finalStyle += ` background-image:url('data:image/svg+xml,${encoded}'); background-size:cover; background-position:center top;`;
        }
        return `<h${lvl} style="${finalStyle}">${content}${after}</h${lvl}>`;
      }

      return `<h${lvl} style="${finalStyle}">${before}${content}${after}</h${lvl}>`;
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
      // 只补齐换行与溢出行为，不覆盖预设自带的背景、边框、文字色
      const shellBehavior = 'white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere;overflow-x:hidden';
      const preStyle = `${style};${shellBehavior}`;
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

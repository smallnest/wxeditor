/* ============================================================
   样式预设库
   每个预设是一个"修饰函数"，接收 base style 对象并返回修改后的版本
   或者直接定义样式片段，在 renderer 中被合并
   ============================================================ */

window.PRESETS = {

  // ============ 全局 ============
  global: {
    fontFamily: [
      { id: 'serif-zh',  name: '书卷衬线', value: "'PingFang SC', 'Songti SC', 'Source Han Serif SC', 'Noto Serif CJK SC', serif" },
      { id: 'sans-zh',   name: '现代无衬线', value: "-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif" },
      { id: 'fangsong',  name: '仿宋文艺', value: "'FangSong', 'STFangsong', '仿宋', serif" },
      { id: 'kaiti',     name: '楷体雅致', value: "'KaiTi', 'STKaiti', '楷体', serif" },
      { id: 'mixed',     name: '中西混排', value: "'Source Serif Pro', Georgia, 'PingFang SC', serif" },
      { id: 'rounded',   name: '圆润亲和', value: "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif" },
    ],
  },

  // ============ H1 ============
  h1: [
    { id: 'plain',       name: '素净居中', style: 'text-align:center; font-size:{fs}px; font-weight:700; color:{c}; margin:28px 0 20px; line-height:1.4;' },
    { id: 'underline',   name: '下划装饰', style: 'text-align:center; font-size:{fs}px; font-weight:700; color:{c}; margin:28px 0 20px; padding-bottom:12px; border-bottom:2px solid {c}; line-height:1.4;' },
    { id: 'leftbar',     name: '左竖条', style: 'font-size:{fs}px; font-weight:700; color:{c}; margin:28px 0 20px; padding-left:14px; border-left:5px solid {c}; line-height:1.4;' },
    { id: 'bottomwave',  name: '底部波浪', style: 'text-align:center; font-size:{fs}px; font-weight:700; color:{c}; margin:28px 0 24px; padding-bottom:12px; background-image:linear-gradient(transparent calc(100% - 3px), {c} 3px); background-size:16px 100%; background-repeat:repeat-x; background-position:bottom; line-height:1.4;' },
    { id: 'diamond',     name: '左右菱形', style: 'text-align:center; font-size:{fs}px; font-weight:700; color:{c}; margin:28px 0 20px; line-height:1.4;', prefix: '◆ ', suffix: ' ◆' },
    { id: 'cardfill',    name: '卡片填充', style: 'text-align:center; font-size:{fs}px; font-weight:700; color:#fff; margin:28px 0 20px; padding:16px 18px; background:{c}; border-radius:10px; line-height:1.4;' },
    { id: 'softcard',    name: '柔和底色', style: 'font-size:{fs}px; font-weight:700; color:{c}; margin:28px 0 20px; padding:14px 18px; background:{cbg}; border-radius:8px; line-height:1.4;' },
    { id: 'numbered',    name: '数字徽章', style: 'font-size:{fs}px; font-weight:700; color:{c}; margin:28px 0 20px; display:flex; align-items:center; gap:12px; line-height:1.4;', badge: true },
    { id: 'doubleline',  name: '双细线', style: 'text-align:center; font-size:{fs}px; font-weight:700; color:{c}; margin:28px 0 20px; padding:14px 0; border-top:1px solid {c}; border-bottom:1px solid {c}; line-height:1.4;' },
    { id: 'tagline',     name: '标签形', style: 'font-size:{fs}px; font-weight:700; color:#fff; margin:28px 0 20px; display:inline-block; padding:8px 18px 8px 14px; background:{c}; border-radius:0 24px 24px 0; line-height:1.4;' },
    { id: 'bookmark',    name: '书签造型', style: 'font-size:{fs}px; font-weight:700; color:#fff; margin:28px 0 20px; display:inline-block; padding:10px 20px 10px 14px; background:{c}; clip-path:polygon(0 0, 100% 0, calc(100% - 14px) 50%, 100% 100%, 0 100%); line-height:1.4;' },
    { id: 'stripes',     name: '斜纹背景', style: 'text-align:center; font-size:{fs}px; font-weight:700; color:{c}; margin:28px 0 20px; padding:16px; background:repeating-linear-gradient(-45deg, {cbg}, {cbg} 8px, transparent 8px, transparent 16px); border-radius:8px; line-height:1.4;' },
  ],

  // ============ H2 ============
  h2: [
    { id: 'plain',       name: '素净', style: 'font-size:{fs}px; font-weight:700; color:{c}; margin:28px 0 16px; line-height:1.45;' },
    { id: 'leftbar',     name: '左竖条', style: 'font-size:{fs}px; font-weight:700; color:{c}; margin:28px 0 16px; padding-left:12px; border-left:4px solid {c}; line-height:1.45;' },
    { id: 'underline',   name: '下划线', style: 'font-size:{fs}px; font-weight:700; color:{c}; margin:28px 0 16px; padding-bottom:8px; border-bottom:2px solid {c}; line-height:1.45;' },
    { id: 'dashed',      name: '虚线底', style: 'font-size:{fs}px; font-weight:700; color:{c}; margin:28px 0 16px; padding-bottom:8px; border-bottom:1px dashed {c}; line-height:1.45;' },
    { id: 'numdot',      name: '数字前缀', style: 'font-size:{fs}px; font-weight:700; color:{c}; margin:28px 0 16px; line-height:1.45;', numPrefix: true },
    { id: 'cornerbrace', name: '方角装饰', style: 'font-size:{fs}px; font-weight:700; color:{c}; margin:28px 0 16px; padding:4px 12px; border-top:2px solid {c}; border-left:2px solid {c}; display:inline-block; line-height:1.45;' },
    { id: 'pillsolid',   name: '胶囊填充', style: 'font-size:{fs}px; font-weight:700; color:#fff; margin:28px 0 16px; display:inline-block; padding:6px 16px; background:{c}; border-radius:999px; line-height:1.45;' },
    { id: 'pillsoft',    name: '胶囊柔色', style: 'font-size:{fs}px; font-weight:700; color:{c}; margin:28px 0 16px; display:inline-block; padding:6px 16px; background:{cbg}; border-radius:999px; line-height:1.45;' },
    { id: 'shortbar',    name: '短粗底线', style: 'font-size:{fs}px; font-weight:700; color:{c}; margin:28px 0 16px; padding-bottom:8px; background-image:linear-gradient({c},{c}); background-repeat:no-repeat; background-size:36px 3px; background-position:left bottom; line-height:1.45;' },
    { id: 'hash',        name: '井号装饰', style: 'font-size:{fs}px; font-weight:700; color:{c}; margin:28px 0 16px; line-height:1.45;', prefix: '# ' },
    { id: 'bracket',     name: '方括号', style: 'font-size:{fs}px; font-weight:700; color:{c}; margin:28px 0 16px; line-height:1.45;', prefix: '【', suffix: '】' },
    { id: 'withbg',      name: '背景块', style: 'font-size:{fs}px; font-weight:700; color:{c}; margin:28px 0 16px; padding:10px 14px; background:{cbg}; border-radius:6px; line-height:1.45;' },
    { id: 'leftchevron', name: '箭头前缀', style: 'font-size:{fs}px; font-weight:700; color:{c}; margin:28px 0 16px; line-height:1.45;', prefix: '❯ ' },
  ],

  // ============ H3 ============
  h3: [
    { id: 'plain',       name: '素净', style: 'font-size:{fs}px; font-weight:600; color:{c}; margin:22px 0 12px; line-height:1.5;' },
    { id: 'bulletbefore',name: '圆点前缀', style: 'font-size:{fs}px; font-weight:600; color:{c}; margin:22px 0 12px; line-height:1.5;', prefix: '● ' },
    { id: 'arrow',       name: '箭头前缀', style: 'font-size:{fs}px; font-weight:600; color:{c}; margin:22px 0 12px; line-height:1.5;', prefix: '▸ ' },
    { id: 'underline',   name: '细下划线', style: 'font-size:{fs}px; font-weight:600; color:{c}; margin:22px 0 12px; padding-bottom:6px; border-bottom:1px solid {c}; line-height:1.5;' },
    { id: 'leftbar',     name: '左细条', style: 'font-size:{fs}px; font-weight:600; color:{c}; margin:22px 0 12px; padding-left:10px; border-left:3px solid {c}; line-height:1.5;' },
    { id: 'emojibook',   name: '书本符号', style: 'font-size:{fs}px; font-weight:600; color:{c}; margin:22px 0 12px; line-height:1.5;', prefix: '📖 ' },
    { id: 'emojispark',  name: '闪光符号', style: 'font-size:{fs}px; font-weight:600; color:{c}; margin:22px 0 12px; line-height:1.5;', prefix: '✦ ' },
    { id: 'labelbg',     name: '标签背景', style: 'font-size:{fs}px; font-weight:600; color:{c}; margin:22px 0 12px; display:inline-block; padding:3px 10px; background:{cbg}; border-radius:4px; line-height:1.5;' },
    { id: 'dottedline',  name: '点线底', style: 'font-size:{fs}px; font-weight:600; color:{c}; margin:22px 0 12px; padding-bottom:6px; border-bottom:2px dotted {c}; line-height:1.5;' },
    { id: 'wave',        name: '波浪底', style: 'font-size:{fs}px; font-weight:600; color:{c}; margin:22px 0 12px; padding-bottom:4px; background-image:linear-gradient(transparent 85%,{c} 85%); background-size:100% 2px; background-repeat:no-repeat; background-position:bottom; line-height:1.5;' },
    { id: 'numsquare',   name: '方块数字', style: 'font-size:{fs}px; font-weight:600; color:{c}; margin:22px 0 12px; display:flex; align-items:center; gap:10px; line-height:1.5;', badgeSq: true },
  ],

  // ============ H4 ============
  h4: [
    { id: 'plain',       name: '素净', style: 'font-size:{fs}px; font-weight:600; color:{c}; margin:18px 0 10px; line-height:1.55;' },
    { id: 'dot',         name: '圆点', style: 'font-size:{fs}px; font-weight:600; color:{c}; margin:18px 0 10px; line-height:1.55;', prefix: '· ' },
    { id: 'arrow',       name: '箭头', style: 'font-size:{fs}px; font-weight:600; color:{c}; margin:18px 0 10px; line-height:1.55;', prefix: '→ ' },
    { id: 'caret',       name: '尖号', style: 'font-size:{fs}px; font-weight:600; color:{c}; margin:18px 0 10px; line-height:1.55;', prefix: '‣ ' },
    { id: 'square',      name: '方块前缀', style: 'font-size:{fs}px; font-weight:600; color:{c}; margin:18px 0 10px; line-height:1.55;', prefix: '▪ ' },
    { id: 'italic',      name: '斜体雅致', style: 'font-size:{fs}px; font-weight:600; font-style:italic; color:{c}; margin:18px 0 10px; line-height:1.55;' },
    { id: 'caps',        name: '小型大写', style: 'font-size:{fs}px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:{c}; margin:18px 0 10px; line-height:1.55;' },
    { id: 'parenth',     name: '括号包裹', style: 'font-size:{fs}px; font-weight:600; color:{c}; margin:18px 0 10px; line-height:1.55;', prefix: '（', suffix: '）' },
    { id: 'leftcolon',   name: '冒号强调', style: 'font-size:{fs}px; font-weight:600; color:{c}; margin:18px 0 10px; line-height:1.55;', suffix: '：' },
    { id: 'softpill',    name: '柔色胶囊', style: 'font-size:{fs}px; font-weight:600; color:{c}; margin:18px 0 10px; display:inline-block; padding:2px 10px; background:{cbg}; border-radius:10px; line-height:1.55;' },
  ],

  // ============ 正文 paragraph ============
  p: [
    { id: 'normal',      name: '标准', style: 'font-size:{fs}px; line-height:{lh}; color:{c}; margin:14px 0; letter-spacing:{ls}px;' },
    { id: 'indent',      name: '首行缩进', style: 'font-size:{fs}px; line-height:{lh}; color:{c}; margin:14px 0; text-indent:2em; letter-spacing:{ls}px;' },
    { id: 'justify',     name: '两端对齐', style: 'font-size:{fs}px; line-height:{lh}; color:{c}; margin:14px 0; text-align:justify; letter-spacing:{ls}px;' },
    { id: 'loose',       name: '宽松行距', style: 'font-size:{fs}px; line-height:{lh}; color:{c}; margin:18px 0; letter-spacing:{ls}px;' },
    { id: 'indentjust',  name: '缩进+两端', style: 'font-size:{fs}px; line-height:{lh}; color:{c}; margin:14px 0; text-indent:2em; text-align:justify; letter-spacing:{ls}px;' },
  ],

  // ============ 引用 blockquote ============
  blockquote: [
    { id: 'leftbar',     name: '左竖条', style: 'border-left:4px solid {c}; padding:8px 14px; margin:16px 0; color:{tc}; font-size:{fs}px; line-height:1.75; background:transparent;' },
    { id: 'leftbar-bg',  name: '左竖条+底', style: 'border-left:4px solid {c}; padding:12px 16px; margin:16px 0; color:{tc}; font-size:{fs}px; line-height:1.75; background:{cbg}; border-radius:0 6px 6px 0;' },
    { id: 'card',        name: '卡片式', style: 'padding:14px 18px; margin:16px 0; color:{tc}; font-size:{fs}px; line-height:1.75; background:{cbg}; border-radius:8px;' },
    { id: 'outlined',    name: '边框卡片', style: 'padding:14px 18px; margin:16px 0; color:{tc}; font-size:{fs}px; line-height:1.75; background:transparent; border:1px solid {c}; border-radius:8px;' },
    { id: 'quote-mark',  name: '引号装饰', style: 'padding:12px 16px 12px 38px; margin:16px 0; color:{tc}; font-size:{fs}px; line-height:1.75; background:{cbg}; border-radius:8px; position:relative;', quotemark: true },
    { id: 'center',      name: '居中楷体', style: 'padding:14px 20px; margin:20px 40px; color:{tc}; font-size:{fs}px; line-height:1.85; text-align:center; font-style:italic; border-top:1px solid {c}; border-bottom:1px solid {c};' },
    { id: 'corner',      name: '双角装饰', style: 'padding:14px 16px; margin:16px 0; color:{tc}; font-size:{fs}px; line-height:1.75; background:{cbg}; border-top:2px solid {c}; border-bottom:2px solid {c};' },
    { id: 'soft',        name: '柔色纯底', style: 'padding:14px 18px; margin:16px 0; color:{tc}; font-size:{fs}px; line-height:1.75; background:{cbg}; border-radius:4px;' },
    { id: 'dashedbox',   name: '虚线框', style: 'padding:12px 16px; margin:16px 0; color:{tc}; font-size:{fs}px; line-height:1.75; background:transparent; border:1px dashed {c}; border-radius:6px;' },
    { id: 'notice',      name: '提示样式', style: 'padding:12px 14px 12px 38px; margin:16px 0; color:{tc}; font-size:{fs}px; line-height:1.75; background:{cbg}; border-left:3px solid {c}; border-radius:0 4px 4px 0; position:relative;', notice: true },
  ],

  // ============ 代码块 pre ============
  pre: [
    { id: 'lightgrey',   name: '浅灰', style: 'background:#F6F4EF; color:#2B2016; border-radius:8px; padding:14px 16px; font-size:13px; line-height:1.7; white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere; font-family:\'SF Mono\',\'JetBrains Mono\',Menlo,Consolas,monospace; margin:16px 0;' },
    { id: 'warm-paper',  name: '米白纸本', style: 'background:#FAF7F0; color:#3D2E20; border:1px solid #EAE3D4; border-radius:8px; padding:14px 16px; font-size:13px; line-height:1.7; white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere; font-family:\'SF Mono\',\'JetBrains Mono\',Menlo,Consolas,monospace; margin:16px 0;' },
    { id: 'ink-dark',    name: '墨色暗调', style: 'background:#2B2016; color:#E6D9C4; border-radius:8px; padding:14px 16px; font-size:13px; line-height:1.7; white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere; font-family:\'SF Mono\',\'JetBrains Mono\',Menlo,Consolas,monospace; margin:16px 0;' },
    { id: 'black-terminal', name: '终端黑', style: 'background:#0F0F0F; color:#E4E4E4; border-radius:6px; padding:14px 16px; font-size:13px; line-height:1.7; white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere; font-family:\'SF Mono\',\'JetBrains Mono\',Menlo,Consolas,monospace; margin:16px 0;' },
    { id: 'github-light',name: 'GitHub 浅', style: 'background:#F6F8FA; color:#24292F; border:1px solid #D0D7DE; border-radius:6px; padding:14px 16px; font-size:13px; line-height:1.7; white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere; font-family:\'SF Mono\',\'JetBrains Mono\',Menlo,Consolas,monospace; margin:16px 0;' },
    { id: 'dracula',     name: '紫夜', style: 'background:#282A36; color:#F8F8F2; border-radius:8px; padding:14px 16px; font-size:13px; line-height:1.7; white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere; font-family:\'SF Mono\',\'JetBrains Mono\',Menlo,Consolas,monospace; margin:16px 0;' },
    { id: 'solarized',   name: '日晒浅', style: 'background:#FDF6E3; color:#586E75; border-radius:8px; padding:14px 16px; font-size:13px; line-height:1.7; white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere; font-family:\'SF Mono\',\'JetBrains Mono\',Menlo,Consolas,monospace; margin:16px 0;' },
    { id: 'blueprint',   name: '蓝印', style: 'background:#0B3D66; color:#E5F0FA; border-radius:8px; padding:14px 16px; font-size:13px; line-height:1.7; white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere; font-family:\'SF Mono\',\'JetBrains Mono\',Menlo,Consolas,monospace; margin:16px 0;' },
    { id: 'subtle-border', name: '细框素', style: 'background:#FFFFFF; color:#2B2016; border:1px solid #E4DED2; border-radius:4px; padding:14px 16px; font-size:13px; line-height:1.7; white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere; font-family:\'SF Mono\',\'JetBrains Mono\',Menlo,Consolas,monospace; margin:16px 0;' },
    { id: 'accent-bar',  name: '左侧色条', style: 'background:#F6F4EF; color:#2B2016; border-left:4px solid {c}; border-radius:0 6px 6px 0; padding:14px 16px; font-size:13px; line-height:1.7; white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere; font-family:\'SF Mono\',\'JetBrains Mono\',Menlo,Consolas,monospace; margin:16px 0;' },
  ],

  // ============ 行内代码 code ============
  code: [
    { id: 'pill-soft',   name: '柔色胶囊', style: 'background:{cbg}; color:{c}; padding:2px 6px; border-radius:4px; font-family:\'SF Mono\',Menlo,Consolas,monospace; font-size:0.92em;' },
    { id: 'filled',      name: '主色填充', style: 'background:{c}; color:#fff; padding:2px 6px; border-radius:4px; font-family:\'SF Mono\',Menlo,Consolas,monospace; font-size:0.92em;' },
    { id: 'outlined',    name: '描边', style: 'background:transparent; color:{c}; border:1px solid {c}; padding:1px 6px; border-radius:4px; font-family:\'SF Mono\',Menlo,Consolas,monospace; font-size:0.92em;' },
    { id: 'underline',   name: '下划强调', style: 'background:transparent; color:{c}; border-bottom:1px dashed {c}; padding:0 2px; font-family:\'SF Mono\',Menlo,Consolas,monospace; font-size:0.95em;' },
    { id: 'grey-ink',    name: '灰底墨字', style: 'background:#F0EBE0; color:#2B2016; padding:2px 6px; border-radius:3px; font-family:\'SF Mono\',Menlo,Consolas,monospace; font-size:0.92em;' },
    { id: 'mark',        name: '荧光笔', style: 'background:{cbg}; color:{c}; padding:0 4px; font-family:\'SF Mono\',Menlo,Consolas,monospace; font-size:0.95em; font-weight:600;' },
  ],

  // ============ 无序列表 ul (li marker) ============
  ul: [
    { id: 'disc',        name: '实心圆', marker: '●', style: 'color:{c};' },
    { id: 'circle',      name: '空心圆', marker: '○', style: 'color:{c};' },
    { id: 'square',      name: '方块', marker: '■', style: 'color:{c};' },
    { id: 'diamond',     name: '菱形', marker: '◆', style: 'color:{c};' },
    { id: 'arrow',       name: '箭头', marker: '▸', style: 'color:{c};' },
    { id: 'dash',        name: '短横', marker: '—', style: 'color:{c};' },
    { id: 'check',       name: '对勾', marker: '✓', style: 'color:{c};' },
    { id: 'star',        name: '星号', marker: '✦', style: 'color:{c};' },
    { id: 'dot-small',   name: '小圆点', marker: '•', style: 'color:{c};' },
    { id: 'heart',       name: '爱心', marker: '♥', style: 'color:{c};' },
    { id: 'flower',      name: '花饰', marker: '❋', style: 'color:{c};' },
    { id: 'rightpoint',  name: '右三角', marker: '▶', style: 'color:{c};' },
  ],

  // ============ 有序列表 ol ============
  ol: [
    { id: 'arabic',      name: '阿拉伯数字', format: '{n}.', style: 'color:{c}; font-weight:600;' },
    { id: 'paren',       name: '括号', format: '{n})', style: 'color:{c}; font-weight:600;' },
    { id: 'circled',     name: '圆圈数字', format: 'circled', style: 'color:{c}; font-weight:700;' },
    { id: 'square',      name: '方块数字', format: 'square', style: 'color:#fff; background:{c}; padding:0 6px; border-radius:3px; font-weight:600; font-size:0.85em;' },
    { id: 'hash',        name: '井号', format: '{n}#', style: 'color:{c}; font-weight:600;' },
    { id: 'dot',         name: '句点', format: '{n}．', style: 'color:{c}; font-weight:600;' },
    { id: 'chinese',     name: '中文数字', format: 'chinese', style: 'color:{c}; font-weight:600;' },
    { id: 'bracket',     name: '方括号', format: '[{n}]', style: 'color:{c}; font-weight:600;' },
    { id: 'step',        name: 'STEP', format: 'STEP {n}', style: 'color:{c}; font-weight:700; font-size:0.85em; letter-spacing:1px;' },
    { id: 'pipe',        name: '竖线', format: '{n} |', style: 'color:{c}; font-weight:600;' },
  ],

  // ============ 链接 a ============
  a: [
    { id: 'underline',   name: '下划线', style: 'color:{c}; text-decoration:underline; text-underline-offset:3px;' },
    { id: 'bold',        name: '加粗无下划线', style: 'color:{c}; text-decoration:none; font-weight:600;' },
    { id: 'dashed',      name: '虚下划线', style: 'color:{c}; text-decoration:none; border-bottom:1px dashed {c}; padding-bottom:1px;' },
    { id: 'highlight',   name: '荧光背景', style: 'color:{c}; text-decoration:none; background:{cbg}; padding:1px 3px; border-radius:2px;' },
    { id: 'plain',       name: '无装饰', style: 'color:{c}; text-decoration:none;' },
    { id: 'arrow',       name: '带箭头', style: 'color:{c}; text-decoration:underline; text-underline-offset:3px;', suffix: ' ↗' },
    { id: 'double',      name: '双下划线', style: 'color:{c}; text-decoration:underline double; text-underline-offset:3px;' },
  ],

  // ============ 图片 img ============
  img: [
    { id: 'plain',       name: '直角素净', imgStyle: 'display:block; max-width:100%; margin:16px auto; border-radius:0;', capStyle: 'text-align:center; color:#9C8E7F; font-size:13px; margin:8px 0 16px; font-style:italic;' },
    { id: 'rounded',     name: '小圆角', imgStyle: 'display:block; max-width:100%; margin:16px auto; border-radius:8px;', capStyle: 'text-align:center; color:#9C8E7F; font-size:13px; margin:8px 0 16px; font-style:italic;' },
    { id: 'bigrounded',  name: '大圆角', imgStyle: 'display:block; max-width:100%; margin:16px auto; border-radius:16px;', capStyle: 'text-align:center; color:#9C8E7F; font-size:13px; margin:8px 0 16px; font-style:italic;' },
    { id: 'shadow',      name: '柔和阴影', imgStyle: 'display:block; max-width:100%; margin:16px auto; border-radius:8px; box-shadow:0 8px 24px rgba(0,0,0,0.12);', capStyle: 'text-align:center; color:#9C8E7F; font-size:13px; margin:8px 0 16px; font-style:italic;' },
    { id: 'bordered',    name: '边框素描', imgStyle: 'display:block; max-width:100%; margin:16px auto; border-radius:4px; border:1px solid #E4DED2; padding:6px; background:#fff;', capStyle: 'text-align:center; color:#9C8E7F; font-size:13px; margin:8px 0 16px; font-style:italic;' },
    { id: 'polaroid',    name: '宝丽来', imgStyle: 'display:block; max-width:100%; margin:16px auto; border-radius:2px; padding:8px 8px 28px; background:#fff; box-shadow:0 4px 14px rgba(0,0,0,0.12);', capStyle: 'text-align:center; color:#6B5D4F; font-size:13px; margin:-24px 0 16px; position:relative; z-index:2; font-family:\'Caveat\',\'Hiragino Sans GB\',cursive;' },
    { id: 'circle',      name: '圆形裁切', imgStyle: 'display:block; max-width:70%; margin:16px auto; border-radius:50%; aspect-ratio:1/1; object-fit:cover;', capStyle: 'text-align:center; color:#9C8E7F; font-size:13px; margin:8px 0 16px; font-style:italic;' },
    { id: 'darkframe',   name: '浅色框', imgStyle: 'display:block; max-width:100%; margin:16px auto; border-radius:14px; padding:10px; background:linear-gradient(180deg, #FFFDFC 0%, #F7F3EE 100%); border:1px solid #E7DDD2; box-shadow:0 10px 24px rgba(15, 23, 42, 0.08);', capStyle: 'text-align:center; color:#8B7C6E; font-size:13px; margin:10px 0 18px; letter-spacing:0.02em;' },
  ],

  // ============ 分割线 hr ============
  hr: [
    { id: 'thin',        name: '细线', style: 'border:none; border-top:1px solid {c}; margin:28px 0;' },
    { id: 'thick',       name: '粗线', style: 'border:none; border-top:3px solid {c}; margin:28px 0;' },
    { id: 'dashed',      name: '虚线', style: 'border:none; border-top:1px dashed {c}; margin:28px 0;' },
    { id: 'dotted',      name: '点线', style: 'border:none; border-top:2px dotted {c}; margin:28px 0;' },
    { id: 'double',      name: '双线', style: 'border:none; border-top:3px double {c}; margin:28px 0;' },
    { id: 'short',       name: '短线居中', style: 'border:none; height:2px; background:{c}; width:60px; margin:28px auto;' },
    { id: 'gradient',    name: '渐变淡出', style: 'border:none; height:1px; background:linear-gradient(90deg, transparent, {c}, transparent); margin:28px 0;' },
    { id: 'diamond',     name: '菱形装饰', decorative: '◆ ◆ ◆', style: 'border:none; text-align:center; color:{c}; font-size:14px; margin:28px 0; letter-spacing:8px;' },
    { id: 'star',        name: '星号装饰', decorative: '✦ ✦ ✦', style: 'border:none; text-align:center; color:{c}; font-size:14px; margin:28px 0; letter-spacing:8px;' },
    { id: 'leaves',      name: '叶饰', decorative: '❈ ❈ ❈', style: 'border:none; text-align:center; color:{c}; font-size:14px; margin:28px 0; letter-spacing:10px;' },
    { id: 'section',     name: '章节符', decorative: '§', style: 'border:none; text-align:center; color:{c}; font-size:18px; margin:28px 0;' },
    { id: 'three-dots',  name: '三点', decorative: '• • •', style: 'border:none; text-align:center; color:{c}; font-size:14px; margin:28px 0; letter-spacing:10px;' },
    { id: 'flower',      name: '花卉', decorative: '❋ ❋ ❋', style: 'border:none; text-align:center; color:{c}; font-size:14px; margin:28px 0; letter-spacing:10px;' },
  ],

  // ============ 表格 table ============
  table: [
    { id: 'plain',       name: '素净', tableStyle: 'border-collapse:collapse; width:100%; margin:16px 0; font-size:14px;', thStyle: 'border:1px solid {c}; padding:8px 12px; background:transparent; color:{c}; font-weight:600; text-align:left;', tdStyle: 'border:1px solid {hair}; padding:8px 12px;' },
    { id: 'zebra',       name: '斑马纹', tableStyle: 'border-collapse:collapse; width:100%; margin:16px 0; font-size:14px;', thStyle: 'padding:10px 12px; background:{c}; color:#fff; font-weight:600; text-align:left;', tdStyle: 'padding:8px 12px; border-bottom:1px solid {hair};', zebra: true, zebraColor: '{cbg}' },
    { id: 'borderless',  name: '无边框', tableStyle: 'border-collapse:collapse; width:100%; margin:16px 0; font-size:14px;', thStyle: 'padding:10px 12px; border-bottom:2px solid {c}; color:{c}; font-weight:600; text-align:left;', tdStyle: 'padding:8px 12px; border-bottom:1px solid {hair};' },
    { id: 'softbg',      name: '柔底表头', tableStyle: 'border-collapse:collapse; width:100%; margin:16px 0; font-size:14px;', thStyle: 'padding:10px 12px; background:{cbg}; color:{c}; font-weight:600; text-align:left;', tdStyle: 'padding:8px 12px; border-bottom:1px solid {hair};' },
    { id: 'outerframe',  name: '外框', tableStyle: 'border-collapse:collapse; width:100%; margin:16px 0; font-size:14px; border:1px solid {c};', thStyle: 'padding:10px 12px; background:{cbg}; color:{c}; font-weight:600; text-align:left; border-bottom:1px solid {c};', tdStyle: 'padding:8px 12px;' },
    { id: 'card',        name: '卡片式', tableStyle: 'border-collapse:separate; border-spacing:0; width:100%; margin:16px 0; font-size:14px; border:1px solid {hair}; border-radius:8px; overflow:hidden;', thStyle: 'padding:10px 12px; background:{c}; color:#fff; font-weight:600; text-align:left;', tdStyle: 'padding:8px 12px; border-bottom:1px solid {hair};' },
  ],

};

/* ============================================================
   预设主题：5 套
   ============================================================ */
window.THEMES = {
  claude: {
    name: '暖棕书卷',
    global: {
      bg: '#FFFFFF',
      ink: '#3D2E20',
      brand: '#C96442',
      brandSoft: '#F5E3D7',
      fontFamily: 'serif-zh',
      maxWidth: 335,
    },
    h1: { preset: 'underline', color: '#C96442', fontSize: 22 },
    h2: { preset: 'leftbar', color: '#C96442', fontSize: 19 },
    h3: { preset: 'underline', color: '#C96442', fontSize: 17 },
    h4: { preset: 'caret', color: '#3D2E20', fontSize: 16 },
    p:  { preset: 'normal', color: '#3D2E20', fontSize: 16, lineHeight: 1.85, letterSpacing: 0.3 },
    blockquote: { preset: 'leftbar-bg', color: '#C96442', textColor: '#6B5D4F', bgColor: '#FAF3EB', fontSize: 15 },
    pre: { preset: 'warm-paper' },
    code: { preset: 'pill-soft', color: '#C96442', bgColor: '#F5E3D7' },
    ul: { preset: 'diamond', color: '#C96442' },
    ol: { preset: 'arabic', color: '#C96442' },
    a: { preset: 'dashed', color: '#C96442' },
    img: { preset: 'rounded' },
    hr: { preset: 'diamond', color: '#C96442' },
    table: { preset: 'softbg', color: '#C96442', bgColor: '#FAF3EB' },
    bold: { color: '#3D2E20' },
    italic: { color: '#6B5D4F' },
  },

  minimal: {
    name: '黑白极简',
    global: {
      bg: '#FFFFFF',
      ink: '#1A1A1A',
      brand: '#1A1A1A',
      brandSoft: '#F0F0F0',
      fontFamily: 'sans-zh',
      maxWidth: 335,
    },
    h1: { preset: 'plain', color: '#1A1A1A', fontSize: 22 },
    h2: { preset: 'shortbar', color: '#1A1A1A', fontSize: 19 },
    h3: { preset: 'plain', color: '#1A1A1A', fontSize: 17 },
    h4: { preset: 'caps', color: '#555555', fontSize: 13 },
    p:  { preset: 'normal', color: '#1A1A1A', fontSize: 16, lineHeight: 1.8, letterSpacing: 0.2 },
    blockquote: { preset: 'leftbar', color: '#1A1A1A', textColor: '#555555', bgColor: '#FAFAFA', fontSize: 15 },
    pre: { preset: 'subtle-border' },
    code: { preset: 'grey-ink', color: '#1A1A1A', bgColor: '#F0F0F0' },
    ul: { preset: 'dash', color: '#1A1A1A' },
    ol: { preset: 'arabic', color: '#1A1A1A' },
    a: { preset: 'underline', color: '#1A1A1A' },
    img: { preset: 'plain' },
    hr: { preset: 'thin', color: '#CCCCCC' },
    table: { preset: 'borderless', color: '#1A1A1A', bgColor: '#FAFAFA' },
    bold: { color: '#000000' },
    italic: { color: '#555555' },
  },

  warm: {
    name: '琥珀橙调',
    global: {
      bg: '#FFFFFF',
      ink: '#5A3A16',
      brand: '#E08A2E',
      brandSoft: '#FCE7C7',
      fontFamily: 'serif-zh',
      maxWidth: 335,
    },
    h1: { preset: 'cardfill', color: '#E08A2E', fontSize: 21 },
    h2: { preset: 'pillsoft', color: '#E08A2E', fontSize: 18 },
    h3: { preset: 'wave', color: '#E08A2E', fontSize: 17 },
    h4: { preset: 'dot', color: '#5A3A16', fontSize: 16 },
    p:  { preset: 'loose', color: '#5A3A16', fontSize: 16, lineHeight: 1.9, letterSpacing: 0.4 },
    blockquote: { preset: 'quote-mark', color: '#E08A2E', textColor: '#8A5A22', bgColor: '#FFF1DB', fontSize: 15 },
    pre: { preset: 'warm-paper' },
    code: { preset: 'mark', color: '#E08A2E', bgColor: '#FCE7C7' },
    ul: { preset: 'flower', color: '#E08A2E' },
    ol: { preset: 'circled', color: '#E08A2E' },
    a: { preset: 'highlight', color: '#E08A2E', bgColor: '#FCE7C7' },
    img: { preset: 'polaroid' },
    hr: { preset: 'leaves', color: '#E08A2E' },
    table: { preset: 'softbg', color: '#E08A2E', bgColor: '#FFF1DB' },
    bold: { color: '#C46F14' },
    italic: { color: '#8A5A22' },
  },

  tech: {
    name: '科技蓝调',
    global: {
      bg: '#FFFFFF',
      ink: '#1E293B',
      brand: '#2563EB',
      brandSoft: '#DBEAFE',
      fontFamily: 'sans-zh',
      maxWidth: 335,
    },
    h1: { preset: 'softcard', color: '#2563EB', fontSize: 22 },
    h2: { preset: 'leftbar', color: '#2563EB', fontSize: 19 },
    h3: { preset: 'arrow', color: '#2563EB', fontSize: 17 },
    h4: { preset: 'square', color: '#1E293B', fontSize: 16 },
    p:  { preset: 'normal', color: '#1E293B', fontSize: 16, lineHeight: 1.8, letterSpacing: 0.2 },
    blockquote: { preset: 'notice', color: '#2563EB', textColor: '#1E3A8A', bgColor: '#DBEAFE', fontSize: 15 },
    pre: { preset: 'github-light' },
    code: { preset: 'pill-soft', color: '#2563EB', bgColor: '#DBEAFE' },
    ul: { preset: 'arrow', color: '#2563EB' },
    ol: { preset: 'square', color: '#2563EB' },
    a: { preset: 'underline', color: '#2563EB' },
    img: { preset: 'shadow' },
    hr: { preset: 'gradient', color: '#2563EB' },
    table: { preset: 'zebra', color: '#2563EB', bgColor: '#F1F5F9' },
    bold: { color: '#1E293B' },
    italic: { color: '#475569' },
  },

  mint: {
    name: '薄荷青绿',
    global: {
      bg: '#FFFFFF',
      ink: '#244B45',
      brand: '#35B89A',
      brandSoft: '#D9F7EF',
      fontFamily: 'rounded',
      maxWidth: 335,
    },
    h1: { preset: 'softcard', color: '#35B89A', fontSize: 22 },
    h2: { preset: 'pillsoft', color: '#2A8F7A', fontSize: 19 },
    h3: { preset: 'leftbar', color: '#35B89A', fontSize: 17 },
    h4: { preset: 'dot', color: '#244B45', fontSize: 16 },
    p:  { preset: 'normal', color: '#244B45', fontSize: 16, lineHeight: 1.85, letterSpacing: 0.25 },
    blockquote: { preset: 'soft', color: '#35B89A', textColor: '#2A6A60', bgColor: '#E8FBF5', fontSize: 15 },
    pre: { preset: 'subtle-border' },
    code: { preset: 'pill-soft', color: '#2A8F7A', bgColor: '#D9F7EF' },
    ul: { preset: 'check', color: '#35B89A' },
    ol: { preset: 'circled', color: '#35B89A' },
    a: { preset: 'highlight', color: '#2A8F7A', bgColor: '#D9F7EF' },
    img: { preset: 'rounded' },
    hr: { preset: 'gradient', color: '#35B89A' },
    table: { preset: 'softbg', color: '#2A8F7A', bgColor: '#E8FBF5' },
    bold: { color: '#1F5C52' },
    italic: { color: '#4F7F77' },
  },

  retro: {
    name: '酒红复古',
    global: {
      bg: '#FFFFFF',
      ink: '#2C2C2C',
      brand: '#F25C54',
      brandSoft: '#FDEBEA',
      fontFamily: 'fangsong',
      maxWidth: 335,
    },
    h1: { preset: 'doubleline', color: '#F25C54', fontSize: 21 },
    h2: { preset: 'bracket', color: '#F25C54', fontSize: 18 },
    h3: { preset: 'emojibook', color: '#F25C54', fontSize: 17 },
    h4: { preset: 'italic', color: '#F25C54', fontSize: 16 },
    p:  { preset: 'indent', color: '#2C2C2C', fontSize: 16, lineHeight: 1.95, letterSpacing: 0.5 },
    blockquote: { preset: 'center', color: '#F25C54', textColor: '#2C2C2C', bgColor: '#FDEBEA', fontSize: 15 },
    pre: { preset: 'warm-paper' },
    code: { preset: 'outlined', color: '#F25C54', bgColor: '#FDEBEA' },
    ul: { preset: 'heart', color: '#F25C54' },
    ol: { preset: 'chinese', color: '#F25C54' },
    a: { preset: 'dashed', color: '#F25C54' },
    img: { preset: 'bordered' },
    hr: { preset: 'flower', color: '#F25C54' },
    table: { preset: 'outerframe', color: '#F25C54', bgColor: '#FDEBEA' },
    bold: { color: '#F25C54' },
    italic: { color: '#888888' },
  },
};

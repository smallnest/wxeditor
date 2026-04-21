# Markdown 编辑器

一款专为微信公众号排版设计的 Markdown 编辑器，支持实时预览、丰富的样式预设和一键复制到公众号。

> 本项目 Fork 自 [zhijunio/article-tools](https://zhijunio.github.io/article-tools/md/)，该项目修改自 [gordensun/WX](https://gordensun.github.io/WX/)。
>
> 相比原始项目 [gordensun/WX](https://gordensun.github.io/WX/)，[zhijunio/article-tools](https://zhijunio.github.io/article-tools/md/) 增加了以下功能：
> - 图片自动压缩（Canvas API 压缩后存入 IndexedDB）
> - 编辑内容和样式设置的本地持久化存储（localStorage）
> - 代码块语法高亮（highlight.js）
> - 复制到公众号时图片自动转为 Base64 内嵌
> - 复制时链接自动转换为纯文本，避免公众号外链限制
> - 智能粘贴（富文本自动转 Markdown、粘贴/拖拽图片上传）
> - 更多样式预设和主题

## 功能特性

- **实时预览** — 编辑区与手机预览区同步滚动，所见即所得
- **丰富样式预设** — 5 套内置主题（暖棕书卷、黑白极简、琥珀橙调、科技蓝调、薄荷青绿、酒红复古），涵盖标题、正文、引用、代码块、列表、表格等全部元素
- **样式精细调节** — 右侧面板可调整字号、行距、字间距、颜色、最大宽度等参数，实时生效
- **随机色系 / 随机风格** — 一键随机切换配色或各元素样式组合，快速获取灵感
- **一键复制到公众号** — 生成的 HTML 使用内联样式，粘贴到公众号后台直接可用，图片自动转为 Base64
- **复制 HTML 源码** — 可复制渲染后的 HTML 代码用于其他平台
- **智能粘贴** — 粘贴富文本自动转换为 Markdown，支持粘贴图片
- **拖拽上传图片** — 支持拖拽或粘贴图片到编辑区，自动压缩并存储到 IndexedDB
- **自定义主题管理** — 保存、重命名、删除自定义主题，支持导入/导出 JSON 配置
- **本地存储** — 编辑内容和样式设置自动保存到 localStorage，刷新不丢失

## 技术栈

- **marked.js** — Markdown 解析
- **highlight.js** — 代码语法高亮
- **Turndown** — HTML 转 Markdown（智能粘贴）
- **IndexedDB** — 本地图片存储
- **Canvas API** — 图片压缩

## 快速开始

需要一个静态文件服务器来运行（浏览器安全策略限制 `file://` 协议读取文件）：

```bash
# 使用 Python
python3 -m http.server

# 或使用 Node.js
npx serve .
```

然后在浏览器中打开 `http://localhost:8000`。

## 文件结构

```
├── index.html           # 主页面
├── index.css            # 界面样式
├── index.js             # 应用主逻辑（编辑、渲染、复制、主题管理等）
├── index.presets.js     # 样式预设库（各元素的样式模板）和内置主题
├── index.renderer.js    # Markdown → HTML 渲染器（自定义 marked renderer）
└── sample.md            # 示例 Markdown 文件
```

## 使用说明

1. 在左侧编辑区输入或粘贴 Markdown 内容
2. 中间预览区实时显示排版效果（模拟手机 375px 宽度）
3. 右侧面板调整各元素样式（点击标题展开对应设置）
4. 顶部工具栏切换主题、随机配色/风格
5. 排版满意后，点击「复制到公众号」按钮，粘贴到公众号编辑器即可

## 许可证

MIT

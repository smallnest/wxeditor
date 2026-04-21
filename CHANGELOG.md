# Changelog · 公众号排版器

记录 [`md/`](https://github.com/zhijunio/github/article-tools/tree/main/md) 下的变更。未单独发 npm 版本时，以日期分段。

---

### 当前实现概要

| 类别 | 说明 |
|------|------|
| **入口** | 浏览器打开 `md/index.html`；样式与逻辑见 `index.css`、`index.js`。 |
| **预设与主题** | `index.presets.js` 提供 `PRESETS`；`THEMES` 含多套配色；支持自定义主题的增删改与列表展示。 |
| **渲染** | `index.renderer.js` 暴露 `renderMarkdown`：Markdown → 带内联样式的 HTML，便于粘贴公众号后台。 |
| **Markdown 栈** | [marked](https://github.com/markedjs/marked) 解析；[highlight.js](https://highlightjs.org/) 代码高亮；[Turndown](https://github.com/mixmark-io/turndown) 用于从 HTML 转回 Markdown 的粘贴场景。 |
| **图片** | 上传/粘贴后可选压缩；`img://` 占位与 IndexedDB（库名 `WechatEditorImages`）存 blob；预览与「复制到公众号」链路中恢复为可用图片。 |
| **粘贴** | 智能处理剪贴板中的图片文件、HTML（含常见编辑器结构）、纯文本。 |
| **复制** | 「复制到公众号」写入富文本（`ClipboardItem` + HTML）；「复制 HTML」复制源码；含剪贴板图片的再压缩等兼容逻辑。 |
| **持久化** | `localStorage` 键 `mp_md_formatter_v1`；支持 JSON 配置导入/导出。 |
| **其它** | 编辑区与预览区滚动同步；随机配色 / 随机样式等快捷操作。 |

### 外部依赖（CDN）

通过 jsDelivr 加载：`marked`、`highlight.js`（含 `github.min.css` 主题样式）、`turndown`。需联网；本地直接打开文件时部分环境可能对剪贴板有限制，可用本地 HTTP 服务访问。
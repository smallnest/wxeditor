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

---

### 2026-04-22

#### fork 后功能扩展

- 新增公众号 Markdown 编辑器主界面：编辑区、手机预览区、样式面板三栏布局。
- 新增预览/编辑联动能力：滚动同步、编辑区折叠后切换为 `1024px` 网页预览。
- 新增 Markdown 辅助工具：格式化、外链转脚注、随机色系、随机风格。
- 新增图片处理链路：粘贴/拖拽上传、压缩、`img://` 占位、IndexedDB 持久化、复制到公众号时恢复图片。
- 新增 JSON 导入/导出、自定义主题保存/重命名/删除、主题下拉切换。

#### 主题与样式库扩展

- 新增大量主题预设，包括一组公众号风格主题与一组公司风格主题。
- 主题下拉框排序优化：中文主题优先显示，其余主题按中文 locale 排序。
- 新增多批标题 SVG 装饰预设，补充 H1/H2/H3/H4 的装饰变化。
- 调整 H3 `点尾线` 装饰，改为更完整的“短线 + 渐弱点列”收尾。
- H2/H3/H4 新增“前缀装饰”输入能力，允许用户直接输入 Unicode 字符作为标题前缀。

#### 代码块与代码高亮

- 修正代码块样式覆盖关系：`pre` 预设负责容器背景、边框、圆角与基色，`highlight.js` 主题负责 token 语法高亮。
- 移除预览区对代码块统一浅色底的强制覆盖，恢复代码块预设切换效果。
- 新增多套 dark 代码块预设：`午夜蓝`、`石墨灰`、`夜林`、`黑曜`、`余烬暗棕`、`深海`。
- 顶栏新增“代码主题”下拉框，支持切换 `highlight.js` 官方 examples 中的主题样式。
- 代码主题下拉框支持持久化，刷新后保留上次所选代码高亮主题。
- 代码主题名称过长时在下拉框中做截断显示，避免撑宽顶栏布局。
- 代码主题列表按代码块背景明暗过滤：浅色代码块只显示 light 代码主题，深色代码块只显示 dark 代码主题。

#### 依赖与外部资源

- `highlight.js` 代码主题从固定 `github.min.css` 扩展为可动态切换的主题样式表。
- 代码主题列表来源参考官方 examples 页面：<https://highlightjs.org/examples>。

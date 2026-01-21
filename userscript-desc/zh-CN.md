# 🔗 链接助手

支持所有网站在新标签页中打开第三方网站链接（外链），在新标签页中打开符合指定规则的本站链接，解析文本链接为超链接，微信公众号文本转可点击的超链接，图片链接转图片标签，解析 Markdown 格式链接与图片标签，解析 BBCode 格式链接与图片标签。

支持谷歌搜索，Youtube, GitHub, Greasy Fork, V2EX, 微信公众号等所有网站与论坛。

- 在新标签页中打开第三方网站链接（外链） ✅
- 每个站点可以单独设置是否启用 ✅
- 设置规则功能，在新标签页中打开符合指定规则的链接 ✅
- 可以在新标签页中后台打开链接 ✅
- 解析文本链接为超链接，微信公众号文本转可点击的超链接 ✅
- 图片代理功能，解决因网络限制无法加载图片的问题 ✅
- 自动识别图片链接，转成图片标签 ✅
- 解析 Markdown 格式链接与图片标签 ✅
- 解析 BBCode 格式链接与图片标签 ✅
- 去掉页面中指定区域的超链接 ✅

![screenshots](https://greasyfork.s3.us-east-2.amazonaws.com/zbbbksxhu0ntfxbryzp84s3dz88b)

---

![screenshots](https://greasyfork.s3.us-east-2.amazonaws.com/64sziug83grudizqd5n0znt29uk1)

---

![screenshots](https://greasyfork.s3.us-east-2.amazonaws.com/yb39fs31zlrhhjlcc0n39yctn5i6)

## 使用技巧

### 内部链接新标签页打开规则示例（仅供参考）

| 网站        | 规则                        | 备注                         |
| ----------- | --------------------------- | ---------------------------- |
| Youtube     | `^/watch`<br/>`^/shorts`    | 播放页                       |
| X (Twitter) | `^/\w+$`                    | 用户主页                     |
| X (Twitter) | `/status/`                  | 推文（点击日期链接时生效）   |
| Discourse   | `^/t/`                      | 话题页                       |
| Discourse   | `^/u/[^/]+$`                | 用户页                       |
| Flarum      | `^/d/`                      | 讨论页                       |
| GitHub      | `/issues/\d+$`              | 问题页                       |
| V2EX        | `^/t/\d+`                   | 主题页                       |
| V2EX        | `^/member/[^/]+$`           | 用户主页                     |
| V2EX        | `^/settings`                | 设置页                       |
| V2EX        | `^/notifications`           | 通知页                       |
| GreasyFork  | `/scripts/[^/]+$`           | 脚本页                       |
| GreasyFork  | `/discussions/\d+$`         | 讨论页                       |
| 通用        | `*`                         | 所有链接                     |
| 通用        | `!/posts/new`<br/>`/posts/` | 帖子页除了 `/posts/new` 页面 |

## 其他

兼容以下用户脚本管理器

- Tampermonkey (推荐)
- Violentmonkey
- Greasemonkey
- Userscripts (Safari)

## 安装地址

- Chrome: [Chrome Web Store](https://chromewebstore.google.com/detail/links-helper/lkgnmfiahabppglkjkggllokkiidikij)
- Edge: [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/links-helper/ehoanikfmmcknoiofnnfnnloaclakpcj)
- Firefox: [Firefox Addon Store](https://addons.mozilla.org/firefox/addon/links-helper/)
- Userscript: [Greasy Fork](https://greasyfork.org/zh-CN/scripts/464541-links-helper) · [ScriptCat](https://scriptcat.org/zh-CN/script-show-page/4486) · [GitHub](https://github.com/utags/links-helper/raw/refs/heads/main/build/userscript-prod/links-helper.user.js)

## About

- Repository: [https://github.com/utags/links-helper](https://github.com/utags/links-helper)
- Feedback: [https://github.com/utags/links-helper/issues](https://github.com/utags/links-helper/issues)

## 更多实用脚本

### 🏷️ UTags - 为链接添加用户标签

- **链接**：[Greasy Fork](https://greasyfork.org/zh-CN/scripts/460718-utags-add-usertags-to-links) · [ScriptCat](https://scriptcat.org/zh-CN/script-show-page/2784) · [GitHub](https://github.com/utags/utags/raw/main/packages/extension/build/userscript-prod/utags.user.js)
- **功能**：为用户、帖子、视频和其他链接添加自定义标签和备注
- **亮点**：支持特殊标签过滤（如垃圾、屏蔽、标题党等），数据导出/导入，自动标记已查看帖子
- **支持网站**：V2EX、X(Twitter)、Reddit、GitHub、哔哩哔哩、知乎、Linux.do、Youtube 等 50+ 网站
- **描述**：超级实用的标签管理工具，可为论坛用户或帖子添加标签，轻松识别或屏蔽低质量内容

### 🧰 UTags Advanced Filter

- **链接**：[Greasy Fork](https://greasyfork.org/zh-CN/scripts/556095-utags-advanced-filter) · [ScriptCat](https://scriptcat.org/zh-CN/script-show-page/4653) · [GitHub](https://github.com/utags/utags-advanced-filter/raw/refs/heads/main/build/userscript-prod/utags-advanced-filter.user.js)
- **功能**：支持在 GreasyFork 实时过滤与隐藏脚本
- **亮点**：同时提供用户脚本与浏览器扩展两个版本
- **支持网站**：Greasy Fork
- **描述**：支持在 GreasyFork 实时过滤与隐藏脚本的工具，提供用户脚本和浏览器扩展两种版本。

### ⚡ UTags 快捷导航 (UTags Shortcuts)

- **链接**：[Greasy Fork](https://greasyfork.org/zh-CN/scripts/558485-utags-shortcuts) · [ScriptCat](https://scriptcat.org/zh-CN/script-show-page/4910) · [GitHub](https://github.com/utags/userscripts/raw/main/utags-shortcuts/utags-shortcuts.user.js)
- **功能**：按站点分组、自定义图标、悬浮球或侧边栏导航面板
- **亮点**：悬浮/侧边栏模式、支持链接与脚本、可视化编辑、快捷键支持
- **支持网站**：所有网站
- **描述**：一款功能强大的用户脚本，提供便捷的快捷导航面板，帮助你高效管理常用链接与自动化脚本，提升浏览体验

### 🔍 查找适用于当前网站的脚本

- **链接**：[Greasy Fork](https://greasyfork.org/zh-CN/scripts/550659-find-scripts-for-this-site) · [ScriptCat](https://scriptcat.org/zh-CN/script-show-page/4276) · [GitHub](https://github.com/utags/userscripts/raw/main/find-scripts-for-this-site/find-scripts-for-this-site.user.js)
- **功能**：快速查找当前网站的用户脚本
- **亮点**：支持多个流行的脚本仓库，轻松发现有用的脚本
- **支持网站**：适用于任何网站，查找相关用户脚本
- **描述**：一个方便的工具，用于发现和安装专为您访问的网站设计的用户脚本

### 🖼️ 通用图片上传助手 (Universal Image Uploader)

- **链接**：[Greasy Fork](https://greasyfork.org/zh-CN/scripts/553341-universal-image-uploader) · [ScriptCat](https://scriptcat.org/zh-CN/script-show-page/4467) · [GitHub](https://github.com/utags/userscripts/raw/main/universal-image-uploader/universal-image-uploader.user.js)
- **功能**：粘贴/拖拽/选择图片批量上传到 Imgur/Tikolu/MJJ.Today/Appinn
- **亮点**：自动复制为 Markdown/HTML/BBCode/链接，支持站点按钮与本地历史，兼容单页应用 (SPA)
- **支持网站**：所有网站
- **描述**：在任意网站上粘贴、拖拽或选择图片，批量上传到图床，并按需自动复制为多种格式，支持本地历史记录以便快速复用

## 其他类似脚本

- [新标签页打开链接](https://greasyfork.org/scripts/429714-%E6%96%B0%E6%A0%87%E7%AD%BE%E9%A1%B5%E6%89%93%E5%BC%80%E9%93%BE%E6%8E%A5) (作者 X.I.U) - 所有链接都会新标签页打开
- [External link newtaber](https://greasyfork.org/scripts/40304-external-link-newtaber) (作者 almaceleste)
- [Open external link in new tab](https://greasyfork.org/scripts/9499-open-external-link-in-new-tab) (作者 eight)
- [文本链接自动识别为超链接](https://greasyfork.org/scripts/452150-textlink-to-hyperlink) (作者 DreamNya)
- [微信公众号文本地址转超链接](https://greasyfork.org/scripts/461343-wechat-text-link-to-hyperlink) (作者 runningcheese)
- [链接助手](https://greasyfork.org/scripts/422773-%E9%93%BE%E6%8E%A5%E5%8A%A9%E6%89%8B) (作者 一个北七)

## Release Notes

- 0.13.x
  - 新增“代理 SVG 图片（转换为 PNG）”设置项，默认关闭。
  - 增加图片扩展名过滤，防止代理非图片文件。
  - 支持监听 Shadow DOM 内部的动态内容变化。
  - 优化 MutationObserver 以自动处理 Shadow DOM 的挂载。
  - 修复：移除 SVG 代理时多余的 `output=png` 参数（默认即为 PNG）。
  - 添加图片代理黑名单功能（针对 CSP 限制的网站，如 GitHub, Twitter）。
  - 自动检测 CSP 限制并还原被拦截的图片。
  - 优化图片代理链路（使用 DuckDuckGo 代理以提高隐私性和可用性，并提供回退机制）。
  - 修复：针对特定域名（如 `i.ytimg.com`）跳过 DuckDuckGo 代理，以防止加载失败。
  - 优化：增强代理可靠性，采用双层代理回退机制 (wsrv -> ddg -> wsrv -> original)。
  - 修复：阻止原始图片加载失败时的错误传播。
  - 修复：通过克隆图片元素处理特定的 React 水合问题。
- 0.12.x
  - SVG 图片不走 duckduckgo 代理。
  - 支持代理响应式图片 `srcset` 属性。
  - 修复代理图片时的相对路径解析问题。
  - 优化图片代理逻辑，立即处理新插入的图片元素。
  - 新增图片代理功能，支持全局与按站点单独开关。
  - 支持将现有 `<img>` 标签的图片地址转换为代理 URL，并可选择输出 WebP。
  - 图片代理域名列表支持通配符 `*` 与排除规则 `!domain`。
- 0.11.x
  - 添加设置项：“在当前标签页打开站内链接（覆盖网站默认行为）”。
  - 支持黑名单机制，跳过特定元素的处理（如 Bilibili 稍后再看按钮）。
  - 黑名单新增 BewlyBewly 的“稍后再看”按钮。
  - 判断站内/站外链接时，将 http/https、www/非www 视为同一站点。
- 0.10.x
  - 支持处理 Shadow DOM 内的链接
  - 支持遍历嵌套的 Shadow DOM
  - 在设置菜单中添加手动触发操作：“将文本链接转换为超链接”和“将图片链接转换为图片标签”
- 0.9.x
  - 优化 GM.\* API fallback 逻辑
  - 提升 Greasymonkey, quoid-userscripts, Stay 等脚本管理器的兼容性
  - 添加“在**所有网站**启用在后台打开新标签页”的设置功能
- 0.8.x
  - 修复与 utags-shortcuts 兼容性问题
  - 添加设置项：在当前网站启用将二级域名视为同一网站
  - 浏览器扩展版本支持打开设置
  - 支持在后台打开新标签页，需要在设置里启用，默认关闭
- 0.7.x
  - 处理 Discourse, Flarum, V2EX 主题页相同页面链接的问题
  - 添加单独开关设置是否解析文本链接为超链接，V2EX 默认开，其他网站默认关
  - 支持排除规则：以 '!' 开头的规则匹配时返回 false
  - 支持设置里更改语言，默认根据浏览器语言自动切换
- 0.6.0
  - 支持多国语言
- 0.5.4
  - Prevent converting image links in file list view
- 0.5.3
  - 防止转化在代码查看器、代码编辑器和代码差异查看器中的链接
- 0.5.2
  - Fix String.prototype.replaceAll issues
- 0.5.1 2023.07.24
  - Fix TrustedHTML issues
- 0.5.0 2023.07.21
  - 去掉页面中指定区域的超链接
- 0.4.3 2023.07.10
  - 默认隐藏侧边栏里的设置按钮
  - Update settings module
- 0.4.2 2023.07.07
  - 添加单独开关设置是否把图片链接转为图片标签，V2EX 默认开，其他网站默认关
- 0.4.1 2023.07.04
  - Fix settings style on mobile devices
- 0.4.0 2023.06.30
  - 更新设置模块
- 0.3.5 2023.05.17
  - 修改一些特殊案例
- 0.3.4 2023.05.16
  - 解析 BBCode 风格链接与图片标签
  - 更细解析链接逻辑
- 0.3.3 2023.05.11
  - Fix parse markdown style text
- 0.3.2 2023.05.10
  - Parse Markdown style links and image tags
- 0.3.0 2023.05.10
  - Convert image links to image tags
- 0.2.0 2023.05.09
  - Convert text to hyperlinks
  - Fix opening internal links in a new tab in SPA apps
- 0.1.3 2023.05.08
  - Fix compatibility issues on Violentmonkey, Greasemonkey(Firefox), Userscripts(Safari)
- 0.1.1 2023.04.23
  - Change to run_at: document_start
- 0.1.0 2023.04.23
  - Setting for url rules, open links matching the specified rules in a new tab
- 0.0.2 2023.04.22
  - Add settings menu
  - Enable/Disable userscript
  - Enable/Disable current site

## License

Copyright (c) 2023-2026 [Pipecraft](https://www.pipecraft.net). Licensed under the [MIT License](https://github.com/utags/links-helper/blob/main/LICENSE).

## >\_

[![Pipecraft](https://img.shields.io/badge/site-pipecraft-brightgreen)](https://www.pipecraft.net)
[![UTags](https://img.shields.io/badge/site-UTags-brightgreen)](https://utags.link)

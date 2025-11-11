# 🔗 链接助手

支持所有网站在新标签页中打开第三方网站链接（外链），在新标签页中打开符合指定规则的本站链接，解析文本链接为超链接，微信公众号文本转可点击的超链接，图片链接转图片标签，解析 Markdown 格式链接与图片标签，解析 BBCode 格式链接与图片标签。

支持谷歌搜索，Youtube, GitHub, Greasy Fork, V2EX, 微信公众号等所有网站与论坛。

- 在新标签页中打开第三方网站链接（外链） ✅
- 每个站点可以单独设置开关此脚本 ✅
- 设置规则功能，在新标签页中打开符合指定规则的链接 ✅
- 解析文本链接为超链接，微信公众号文本转可点击的超链接 ✅
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

## About

- Repository: [https://github.com/utags/links-helper](https://github.com/utags/links-helper)
- Feedback: [https://github.com/utags/links-helper/issues](https://github.com/utags/links-helper/issues)

## 更多实用脚本

- 🏷️ UTags - 为链接添加用户标签
  - [Greasy Fork](https://greasyfork.org/zh-CN/scripts/460718-utags-add-usertags-to-links)
  - 为用户/帖子等添加标签与备注，支持过滤、导入导出、自动标记已读等

- 🔄 Discourse 话题快捷切换器
  - [Greasy Fork](https://greasyfork.org/zh-CN/scripts/550982-discourse-topic-quick-switcher)
  - 在 Discourse 论坛中通过悬浮面板与快捷键快速导航话题

- 🔍 查找适用于当前网站的脚本
  - [Greasy Fork](https://greasyfork.org/zh-CN/scripts/550659-find-scripts-for-this-site)
  - 一键在多个仓库中查找当前网站的相关脚本

- 🔃 赐你个头像吧
  - [Greasy Fork](https://greasyfork.org/zh-CN/scripts/472616-replace-ugly-avatars)
  - 换掉别人的头像与昵称

## 其他类似脚本

- [新标签页打开链接](https://greasyfork.org/scripts/429714-%E6%96%B0%E6%A0%87%E7%AD%BE%E9%A1%B5%E6%89%93%E5%BC%80%E9%93%BE%E6%8E%A5) (作者 X.I.U) - 所有链接都会新标签页打开
- [External link newtaber](https://greasyfork.org/scripts/40304-external-link-newtaber) (作者 almaceleste)
- [Open external link in new tab](https://greasyfork.org/scripts/9499-open-external-link-in-new-tab) (作者 eight)
- [文本链接自动识别为超链接](https://greasyfork.org/scripts/452150-textlink-to-hyperlink) (作者 DreamNya)
- [微信公众号文本地址转超链接](https://greasyfork.org/scripts/461343-wechat-text-link-to-hyperlink) (作者 runningcheese)
- [链接助手](https://greasyfork.org/scripts/422773-%E9%93%BE%E6%8E%A5%E5%8A%A9%E6%89%8B) (作者 一个北七)

## Release Notes

- 0.8.x
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

Copyright (c) 2023 [Pipecraft](https://www.pipecraft.net). Licensed under the [MIT License](https://github.com/utags/links-helper/blob/main/LICENSE).

## >\_

[![Pipecraft](https://img.shields.io/badge/site-pipecraft-brightgreen)](https://www.pipecraft.net)
[![UTags](https://img.shields.io/badge/site-UTags-brightgreen)](https://utags.link)

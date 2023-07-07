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

![screenshots](https://greasyfork.s3.us-east-2.amazonaws.com/zbbbksxhu0ntfxbryzp84s3dz88b)

---

![screenshots](https://greasyfork.s3.us-east-2.amazonaws.com/64sziug83grudizqd5n0znt29uk1)

---

![screenshots](https://greasyfork.s3.us-east-2.amazonaws.com/yb39fs31zlrhhjlcc0n39yctn5i6)

## 使用技巧

### 内部链接新标签页打开规则示例（仅供参考）

#### V2EX

主题页，用户主页，设置页

```js
^/t/\d+(#.*)?$
^/member/[^?]*$
^/settings/
```

#### Youtube

播放页

```js
^/watch
^/shorts
```

## 其他

兼容以下用户脚本管理器

- Tampermonkey (推荐)
- Violentmonkey
- Greasemonkey
- Userscripts (Safari)

## About

- Repository: [https://github.com/utags/links-helper](https://github.com/utags/links-helper)
- Feedback: [https://github.com/utags/links-helper/issues](https://github.com/utags/links-helper/issues)

## Other Userscripts

- [🏷️ 小鱼标签 (UTags) - 为链接添加用户标签，支持 V2EX](https://greasyfork.org/scripts/460718-utags-add-usertags-to-links)
- [v2ex.min - V2EX 极简风格](https://greasyfork.org/scripts/463552-v2ex-min)
- [Hacker News 网站切换器](https://greasyfork.org/scripts/462865-hacker-news-apps-switcher)

## 其他类似脚本

- [新标签页打开链接](https://greasyfork.org/scripts/429714-%E6%96%B0%E6%A0%87%E7%AD%BE%E9%A1%B5%E6%89%93%E5%BC%80%E9%93%BE%E6%8E%A5) (作者 X.I.U) - 所有链接都会新标签页打开
- [External link newtaber](https://greasyfork.org/scripts/40304-external-link-newtaber) (作者 almaceleste)
- [Open external link in new tab](https://greasyfork.org/scripts/9499-open-external-link-in-new-tab) (作者 eight)
- [文本链接自动识别为超链接](https://greasyfork.org/scripts/452150-textlink-to-hyperlink) (作者 DreamNya)
- [微信公众号文本地址转超链接](https://greasyfork.org/scripts/461343-wechat-text-link-to-hyperlink) (作者 runningcheese)
- [链接助手](https://greasyfork.org/scripts/422773-%E9%93%BE%E6%8E%A5%E5%8A%A9%E6%89%8B) (作者 一个北七)

## Release Notes

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
[![UTags](https://img.shields.io/badge/site-UTags-brightgreen)](https://utags.pipecraft.net)
[![DTO](https://img.shields.io/badge/site-DTO-brightgreen)](https://dto.pipecraft.net)
[![BestXTools](https://img.shields.io/badge/site-bestxtools-brightgreen)](https://www.bestxtools.com)

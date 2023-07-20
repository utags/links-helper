# 🔗 Links Helper

Open external links in a new tab, open internal links matching the specified rules in a new tab, convert text to hyperlinks, convert image links to image tags(`<img>`), parse Markdown style links and image tags, parse BBCode style links and image tags.

Support all sites includes Google search, Youtube, GitHub, Greasy Fork etc.

- Open external links in a new tab ✅
- Enable/Disable userscript per site ✅
- Setting for url rules, open links matching the specified rules in a new tab ✅
- Convert text to hyperlinks ✅
- Convert image links to image tags ✅
- Parse Markdown style links and image tags ✅
- Parse BBCode style links and image tags ✅
- Erase links from the page ✅

![screenshots](https://greasyfork.s3.us-east-2.amazonaws.com/zbbbksxhu0ntfxbryzp84s3dz88b)

---

![screenshots](https://greasyfork.s3.us-east-2.amazonaws.com/64sziug83grudizqd5n0znt29uk1)

---

![screenshots](https://greasyfork.s3.us-east-2.amazonaws.com/yb39fs31zlrhhjlcc0n39yctn5i6)

## Usages

### Examples of rules that open links in a new tab

#### Youtube

Video player page

```js
^/watch
^/shorts
```

#### V2EX

Subject page, member page, settings page

```js
^/t/\d+(#.*)?$
^/member/[^?]*$
^/settings/
```

## Other

Compatible with the following userscript managers

- Tampermonkey (Recommended)
- Violentmonkey
- Greasemonkey
- Userscripts (Safari)

## About

- Repository: [https://github.com/utags/links-helper](https://github.com/utags/links-helper)
- Feedback: [https://github.com/utags/links-helper/issues](https://github.com/utags/links-helper/issues)

## Other Userscripts

- [🏷️ UTags - Add usertags to links](https://greasyfork.org/scripts/460718-utags-add-usertags-to-links)
- [Hacker News Apps Switcher](https://greasyfork.org/scripts/462865-hacker-news-apps-switcher)

## Related Userscripts

- [新标签页打开链接](https://greasyfork.org/scripts/429714-%E6%96%B0%E6%A0%87%E7%AD%BE%E9%A1%B5%E6%89%93%E5%BC%80%E9%93%BE%E6%8E%A5) (Author X.I.U) - Open all links in a new tab
- [External link newtaber](https://greasyfork.org/scripts/40304-external-link-newtaber) (Author almaceleste)
- [Open external link in new tab](https://greasyfork.org/scripts/9499-open-external-link-in-new-tab) (Author eight)
- [文本链接自动识别为超链接](https://greasyfork.org/scripts/452150-textlink-to-hyperlink) (Author DreamNya)
- [微信公众号文本地址转超链接](https://greasyfork.org/scripts/461343-wechat-text-link-to-hyperlink) (Author runningcheese)
- [链接助手](https://greasyfork.org/scripts/422773-%E9%93%BE%E6%8E%A5%E5%8A%A9%E6%89%8B) (Author 一个北七)

## Release Notes

- 0.5.0 2023.07.21
  - Erase links from the page
- 0.4.3 2023.07.10
  - Hide settings button in side menu by default
  - Update settings module
- 0.4.2 2023.07.07
  - Add setting option for converting image links to image tags
- 0.4.1 2023.07.04
  - Fix settings style on mobile devices
- 0.4.0 2023.06.30
  - Update settings module
- 0.3.5 2023.05.17
  - Fix some edge cases
- 0.3.4 2023.05.16
  - Parse BBCode style links and image tags
  - Update parsing links logic
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

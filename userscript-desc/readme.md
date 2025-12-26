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

| Site        | Rules                       | Notes                                           |
| ----------- | --------------------------- | ----------------------------------------------- |
| Youtube     | `^/watch`<br/>`^/shorts`    | Video player page                               |
| X (Twitter) | `^/\w+$`                    | User profiles                                   |
| X (Twitter) | `/status/`                  | Tweets (click the dates links)                  |
| Discourse   | `^/t/`                      | Post page                                       |
| Discourse   | `^/u/[^/]+$`                | User page                                       |
| Flarum      | `^/d/`                      | Discussions                                     |
| GitHub      | `/issues/\d+$`              | Issue page                                      |
| V2EX        | `^/t/\d+`                   | Subject page                                    |
| V2EX        | `^/member/[^/]+$`           | Member page                                     |
| V2EX        | `^/settings`                | Settings page                                   |
| V2EX        | `^/notifications`           | Notifications                                   |
| GreasyFork  | `/scripts/[^/]+$`           | Script page                                     |
| GreasyFork  | `/discussions/\d+$`         | Discussion page                                 |
| General     | `*`                         | All links                                       |
| General     | `!/posts/new`<br/>`/posts/` | Posts pages except new post page (`/posts/new`) |

## Other

Compatible with the following userscript managers

- Tampermonkey (Recommended)
- Violentmonkey
- Greasemonkey
- Userscripts (Safari)

## About

- Repository: [https://github.com/utags/links-helper](https://github.com/utags/links-helper)
- Feedback: [https://github.com/utags/links-helper/issues](https://github.com/utags/links-helper/issues)

## More Useful Scripts

### 🏷️ UTags - Add User Tags to Links

- **Link**: [Greasy Fork](https://greasyfork.org/scripts/460718-utags-add-usertags-to-links)
- **Features**: Add custom tags and notes to user, post, video and other links
- **Highlights**: Support special tag filtering (like spam, block, clickbait, etc.), data export/import, auto-mark viewed posts
- **Supported Sites**: V2EX, X(Twitter), Reddit, GitHub, Bilibili, Zhihu, Linux.do, Youtube and 50+ websites
- **Description**: Super useful tag management tool for adding tags to forum users or posts, making it easy to identify or block low-quality content

### 🧰 UTags Advanced Filter

- **Link**: [Greasy Fork](https://greasyfork.org/scripts/556095-utags-advanced-filter) · [ScriptCat](https://scriptcat.org/en/script-show-page/4653) · [GitHub](https://github.com/utags/utags-advanced-filter/raw/refs/heads/main/build/userscript-prod/utags-advanced-filter.user.js)
- **Features**: Real-time filtering and hiding of scripts on GreasyFork
- **Highlights**: Available as both a userscript and a browser extension
- **Supported Sites**: Greasy Fork
- **Description**: A tool that supports real-time filtering and hiding on GreasyFork, available in userscript and browser extension versions

### ⚡ UTags Shortcuts

- **Link**: [Greasy Fork](https://greasyfork.org/scripts/558485-utags-shortcuts) · [ScriptCat](https://scriptcat.org/script-show-page/4910) · [GitHub](https://github.com/utags/userscripts/raw/main/utags-shortcuts/utags-shortcuts.user.js)
- **Features**: Per-site grouping, icon support, floating or sidebar navigation panel
- **Highlights**: Floating/Sidebar modes, URL/JS script support, visual editor, keyboard shortcuts
- **Supported Sites**: All websites
- **Description**: A powerful userscript that streamlines your browsing workflow with a customizable navigation panel for quick access to favorite links and scripts

### 🔍 Find Scripts For This Site

- **Link**: [Greasy Fork](https://greasyfork.org/scripts/550659-find-scripts-for-this-site) · [ScriptCat](https://scriptcat.org/script-show-page/4276) · [GitHub](https://github.com/utags/userscripts/raw/main/find-scripts-for-this-site/find-scripts-for-this-site.user.js)
- **Features**: Quickly find scripts for the current site across multiple repositories
- **Highlights**: Settings dialog, real-time sync, smart domain extraction
- **Supported Sites**: All websites
- **Description**: A user script to quickly find scripts for the current site across multiple repositories, now with a settings dialog and real-time sync across tabs

## Related Userscripts

- [新标签页打开链接](https://greasyfork.org/scripts/429714-%E6%96%B0%E6%A0%87%E7%AD%BE%E9%A1%B5%E6%89%93%E5%BC%80%E9%93%BE%E6%8E%A5) (Author X.I.U) - Open all links in a new tab
- [External link newtaber](https://greasyfork.org/scripts/40304-external-link-newtaber) (Author almaceleste)
- [Open external link in new tab](https://greasyfork.org/scripts/9499-open-external-link-in-new-tab) (Author eight)
- [文本链接自动识别为超链接](https://greasyfork.org/scripts/452150-textlink-to-hyperlink) (Author DreamNya)
- [微信公众号文本地址转超链接](https://greasyfork.org/scripts/461343-wechat-text-link-to-hyperlink) (Author runningcheese)
- [链接助手](https://greasyfork.org/scripts/422773-%E9%93%BE%E6%8E%A5%E5%8A%A9%E6%89%8B) (Author 一个北七)

## Release Notes

- 0.8.x
  - Fix compatibility issues with utags-shortcuts
  - Add setting option to treat subdomains as the same site for the current site
  - Browser extension version supports opening settings
  - Add setting option to open new tab in background, default off
- 0.7.x
  - Handle discourse, flarum, v2ex topic page same page links
  - Add separate switch setting for whether to parse text links to hyperlinks, V2EX default on, other sites default off
  - Support exclusion rules for internal URL patterns (prefix '!' means exclude)
  - Support setting language, default auto switch according to browser language
- 0.6.0
  - Support multi-languages
- 0.5.4
  - Prevent converting image links in file list view
- 0.5.3
  - Prevent converting links in code viewers, code editors and code diff viewers
- 0.5.2
  - Fix String.prototype.replaceAll issues
- 0.5.1 2023.07.24
  - Fix TrustedHTML issues
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
[![UTags](https://img.shields.io/badge/site-UTags-brightgreen)](https://utags.link)

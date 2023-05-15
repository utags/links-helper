// ==UserScript==
// @name                 🔗 Links Helper
// @name:zh-CN           🔗 链接助手
// @namespace            https://github.com/utags/links-helper
// @homepageURL          https://github.com/utags/links-helper#readme
// @supportURL           https://github.com/utags/links-helper/issues
// @version              0.3.4
// @description          Open external links in a new tab, open internal links matching the specified rules in a new tab, convert text to hyperlinks, convert image links to image tags(<img>), parse Markdown style links and image tags, parse BBCode style links and image tags
// @description:zh-CN    支持所有网站在新标签页中打开第三方网站链接（外链），在新标签页中打开符合指定规则的本站链接，解析文本链接为超链接，微信公众号文本转可点击的超链接，图片链接转图片标签，解析 Markdown 格式链接与图片标签，解析 BBCode 格式链接与图片标签
// @icon                 data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTUnIGhlaWdodD0nMTUnIHZpZXdCb3g9JzAgMCAxNSAxNScgZmlsbD0nbm9uZScgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48cGF0aCBkPSdNMyAyQzIuNDQ3NzIgMiAyIDIuNDQ3NzIgMiAzVjEyQzIgMTIuNTUyMyAyLjQ0NzcyIDEzIDMgMTNIMTJDMTIuNTUyMyAxMyAxMyAxMi41NTIzIDEzIDEyVjguNUMxMyA4LjIyMzg2IDEyLjc3NjEgOCAxMi41IDhDMTIuMjIzOSA4IDEyIDguMjIzODYgMTIgOC41VjEySDNWM0w2LjUgM0M2Ljc3NjE0IDMgNyAyLjc3NjE0IDcgMi41QzcgMi4yMjM4NiA2Ljc3NjE0IDIgNi41IDJIM1pNMTIuODUzNiAyLjE0NjQ1QzEyLjkwMTUgMi4xOTQzOSAxMi45Mzc3IDIuMjQ5NjQgMTIuOTYyMSAyLjMwODYxQzEyLjk4NjEgMi4zNjY2OSAxMi45OTk2IDIuNDMwMyAxMyAyLjQ5N0wxMyAyLjVWMi41MDA0OVY1LjVDMTMgNS43NzYxNCAxMi43NzYxIDYgMTIuNSA2QzEyLjIyMzkgNiAxMiA1Ljc3NjE0IDEyIDUuNVYzLjcwNzExTDYuODUzNTUgOC44NTM1NUM2LjY1ODI5IDkuMDQ4ODIgNi4zNDE3MSA5LjA0ODgyIDYuMTQ2NDUgOC44NTM1NUM1Ljk1MTE4IDguNjU4MjkgNS45NTExOCA4LjM0MTcxIDYuMTQ2NDUgOC4xNDY0NUwxMS4yOTI5IDNIOS41QzkuMjIzODYgMyA5IDIuNzc2MTQgOSAyLjVDOSAyLjIyMzg2IDkuMjIzODYgMiA5LjUgMkgxMi40OTk5SDEyLjVDMTIuNTY3OCAyIDEyLjYzMjQgMi4wMTM0OSAxMi42OTE0IDIuMDM3OTRDMTIuNzUwNCAyLjA2MjM0IDEyLjgwNTYgMi4wOTg1MSAxMi44NTM2IDIuMTQ2NDVaJyBmaWxsPSdjdXJyZW50Q29sb3InIGZpbGwtcnVsZT0nZXZlbm9kZCcgY2xpcC1ydWxlPSdldmVub2RkJz48L3BhdGg+PC9zdmc+
// @author               Pipecraft
// @license              MIT
// @match                https://*/*
// @match                http://*/*
// @run-at               document-start
// @grant                GM_addElement
// @grant                GM_addStyle
// @grant                GM.registerMenuCommand
// @grant                GM.getValue
// @grant                GM.setValue
// @grant                GM_addValueChangeListener
// @grant                GM_removeValueChangeListener
// ==/UserScript==
//
//// Recent Updates
//// - 0.3.4 2023.05.16
////    - Parse BBCode style links and image tags
////    - Update parsing links logic
//// - 0.3.3 2023.05.11
////    - Fix parse markdown style text
//// - 0.3.2 2023.05.10
////    - Parse Markdown style links and image tags
//// - 0.3.0 2023.05.10
////    - Convert image links to image tags
//// - 0.2.0 2023.05.09
////    - Convert text to hyperlinks
////    - Fix opening internal links in a new tab in SPA apps
//// - 0.1.3 2023.05.08
////    - Fix compatibility issues on Violentmonkey, Greasemonkey(Firefox), Userscripts(Safari)
//// - 0.1.1 2023.04.23
////    - Change to run_at: document_start
//// - 0.1.0 2023.04.23
////    - Setting for url rules, open links matching the specified rules in a new tab
//// - 0.0.2 2023.04.22
////    - Add settings menu
////    - Enable/Disable userscript
////    - Enable/Disable current site
////
;(() => {
  "use strict"
  var doc = document
  var $ = (selectors, element) => (element || doc).querySelector(selectors)
  var $$ = (selectors, element) => [
    ...(element || doc).querySelectorAll(selectors),
  ]
  var createElement = (tagName, attributes) =>
    setAttributes(doc.createElement(tagName), attributes)
  var addElement = (parentNode, tagName, attributes) => {
    if (!parentNode) {
      return
    }
    if (typeof parentNode === "string") {
      attributes = tagName
      tagName = parentNode
      parentNode = doc.head
    }
    if (typeof tagName === "string") {
      const element = createElement(tagName, attributes)
      parentNode.append(element)
      return element
    }
    setAttributes(tagName, attributes)
    parentNode.append(tagName)
    return tagName
  }
  var addStyle = (styleText) => {
    const element = createElement("style", { textContent: styleText })
    doc.head.append(element)
    return element
  }
  var addEventListener = (element, type, listener, options) => {
    if (!element) {
      return
    }
    if (typeof type === "object") {
      for (const type1 in type) {
        if (Object.hasOwn(type, type1)) {
          element.addEventListener(type1, type[type1])
        }
      }
    } else if (typeof type === "string" && typeof listener === "function") {
      element.addEventListener(type, listener, options)
    }
  }
  var removeEventListener = (element, type, listener, options) => {
    if (!element) {
      return
    }
    if (typeof type === "object") {
      for (const type1 in type) {
        if (Object.hasOwn(type, type1)) {
          element.removeEventListener(type1, type[type1])
        }
      }
    } else if (typeof type === "string" && typeof listener === "function") {
      element.removeEventListener(type, listener, options)
    }
  }
  var getAttribute = (element, name) =>
    element ? element.getAttribute(name) : null
  var setAttribute = (element, name, value) =>
    element ? element.setAttribute(name, value) : void 0
  var setAttributes = (element, attributes) => {
    if (element && attributes) {
      for (const name in attributes) {
        if (Object.hasOwn(attributes, name)) {
          const value = attributes[name]
          if (value === void 0) {
            continue
          }
          if (/^(value|textContent|innerText|innerHTML)$/.test(name)) {
            element[name] = value
          } else if (name === "style") {
            setStyle(element, value, true)
          } else if (/on\w+/.test(name)) {
            const type = name.slice(2)
            addEventListener(element, type, value)
          } else {
            setAttribute(element, name, value)
          }
        }
      }
    }
    return element
  }
  var addAttribute = (element, name, value) => {
    const orgValue = getAttribute(element, name)
    if (!orgValue) {
      setAttribute(element, name, value)
    } else if (!orgValue.includes(value)) {
      setAttribute(element, name, orgValue + " " + value)
    }
  }
  var setStyle = (element, values, overwrite) => {
    if (!element) {
      return
    }
    const style = element.style
    if (typeof values === "string") {
      style.cssText = overwrite ? values : style.cssText + ";" + values
      return
    }
    if (overwrite) {
      style.cssText = ""
    }
    for (const key in values) {
      if (Object.hasOwn(values, key)) {
        style[key] = values[key].replace("!important", "")
      }
    }
  }
  var throttle = (func, interval) => {
    let timeoutId = null
    let next = false
    const handler = (...args) => {
      if (timeoutId) {
        next = true
      } else {
        func.apply(void 0, args)
        timeoutId = setTimeout(() => {
          timeoutId = null
          if (next) {
            next = false
            handler()
          }
        }, interval)
      }
    }
    return handler
  }
  if (typeof Object.hasOwn !== "function") {
    Object.hasOwn = (instance, prop) =>
      Object.prototype.hasOwnProperty.call(instance, prop)
  }
  var addElement2 =
    typeof GM_addElement === "function"
      ? (parentNode, tagName, attributes) => {
          if (!parentNode) {
            return
          }
          if (typeof parentNode === "string") {
            attributes = tagName
            tagName = parentNode
            parentNode = doc.head
          }
          if (typeof tagName === "string") {
            const element = GM_addElement(tagName)
            setAttributes(element, attributes)
            parentNode.append(element)
            return element
          }
          setAttributes(tagName, attributes)
          parentNode.append(tagName)
          return tagName
        }
      : addElement
  var addStyle2 =
    typeof GM_addStyle === "function"
      ? (styleText) => GM_addStyle(styleText)
      : addStyle
  var registerMenuCommand = (name, callback, accessKey) => {
    if (window !== top) {
      return
    }
    if (typeof GM.registerMenuCommand !== "function") {
      console.warn("Do not support GM.registerMenuCommand!")
      return
    }
    GM.registerMenuCommand(name, callback, accessKey)
  }
  var getValue = async (key) => {
    const value = await GM.getValue(key)
    return value && value !== "undefined" ? JSON.parse(value) : void 0
  }
  var setValue = async (key, value) => {
    if (value !== void 0) GM.setValue(key, JSON.stringify(value))
  }
  var addValueChangeListener = (key, func) => {
    if (typeof GM_addValueChangeListener !== "function") {
      console.warn("Do not support GM_addValueChangeListener!")
      return () => void 0
    }
    const listenerId = GM_addValueChangeListener(key, func)
    return () => {
      GM_removeValueChangeListener(listenerId)
    }
  }
  var style_default =
    "#browser_extension_settings{--browser-extension-settings-background-color: #f3f3f3;--browser-extension-settings-text-color: #444444;position:fixed;top:10px;right:30px;min-width:250px;max-height:90%;overflow-y:auto;overflow-x:hidden;display:none;box-sizing:border-box;padding:10px 15px;background-color:var(--browser-extension-settings-background-color);color:var(--browser-extension-settings-text-color);z-index:100000;border-radius:5px;-webkit-box-shadow:0px 10px 39px 10px rgba(62,66,66,.22);-moz-box-shadow:0px 10px 39px 10px rgba(62,66,66,.22);box-shadow:0px 10px 39px 10px rgba(62,66,66,.22) !important}#browser_extension_settings h2{text-align:center;margin:5px 0 0;font-size:18px;font-weight:600;border:none}#browser_extension_settings footer{display:flex;justify-content:center;flex-direction:column;font-size:11px;margin:10px auto 0px;background-color:var(--browser-extension-settings-background-color);color:var(--browser-extension-settings-text-color)}#browser_extension_settings footer a{color:#217dfc;text-decoration:none;padding:0}#browser_extension_settings footer p{text-align:center;padding:0;margin:2px;line-height:13px}#browser_extension_settings .option_groups{background-color:#fff;padding:6px 15px 6px 15px;border-radius:10px;display:flex;flex-direction:column;margin:10px 0 0}#browser_extension_settings .option_groups .action{font-size:14px;border-top:1px solid #ccc;padding:6px 0 6px 0;color:#217dfc;cursor:pointer}#browser_extension_settings .option_groups textarea{margin:10px 0 10px 0;height:100px;width:100%;border:1px solid #a9a9a9;border-radius:4px;box-sizing:border-box}#browser_extension_settings .switch_option{display:flex;justify-content:space-between;align-items:center;border-top:1px solid #ccc;padding:6px 0 6px 0;font-size:14px}#browser_extension_settings .switch_option:first-of-type,#browser_extension_settings .option_groups .action:first-of-type{border-top:none}#browser_extension_settings .switch_option>span{margin-right:10px}#browser_extension_settings .option_groups .tip{position:relative;margin:0;padding:0 15px 0 0;border:none;max-width:none;font-size:14px}#browser_extension_settings .option_groups .tip .tip_anchor{cursor:help;text-decoration:underline}#browser_extension_settings .option_groups .tip .tip_content{position:absolute;bottom:15px;left:0;background-color:#fff;color:var(--browser-extension-settings-text-color);text-align:left;padding:10px;display:none;border-radius:5px;-webkit-box-shadow:0px 10px 39px 10px rgba(62,66,66,.22);-moz-box-shadow:0px 10px 39px 10px rgba(62,66,66,.22);box-shadow:0px 10px 39px 10px rgba(62,66,66,.22) !important}#browser_extension_settings .option_groups .tip .tip_anchor:hover+.tip_content,#browser_extension_settings .option_groups .tip .tip_content:hover{display:block}#browser_extension_settings .option_groups .tip p,#browser_extension_settings .option_groups .tip pre{margin:revert;padding:revert}#browser_extension_settings .option_groups .tip pre{font-family:Consolas,panic sans,bitstream vera sans mono,Menlo,microsoft yahei,monospace;font-size:13px;letter-spacing:.015em;line-height:120%;white-space:pre;overflow:auto;background-color:#f5f5f5;word-break:normal;overflow-wrap:normal;padding:.5em;border:none}#browser_extension_settings .container{--button-width: 51px;--button-height: 24px;--toggle-diameter: 20px;--color-off: #e9e9eb;--color-on: #34c759;width:var(--button-width);height:var(--button-height);position:relative;padding:0;margin:0;flex:none}#browser_extension_settings input[type=checkbox]{opacity:0;width:0;height:0;position:absolute}#browser_extension_settings .switch{width:100%;height:100%;display:block;background-color:var(--color-off);border-radius:calc(var(--button-height)/2);cursor:pointer;transition:all .2s ease-out}#browser_extension_settings .slider{width:var(--toggle-diameter);height:var(--toggle-diameter);position:absolute;left:2px;top:calc(50% - var(--toggle-diameter)/2);border-radius:50%;background:#fff;box-shadow:0px 3px 8px rgba(0,0,0,.15),0px 3px 1px rgba(0,0,0,.06);transition:all .2s ease-out;cursor:pointer}#browser_extension_settings input[type=checkbox]:checked+.switch{background-color:var(--color-on)}#browser_extension_settings input[type=checkbox]:checked+.switch .slider{left:calc(var(--button-width) - var(--toggle-diameter) - 2px)}"
  function createSwitch(options = {}) {
    const container = createElement("label", { class: "container" })
    const checkbox = createElement(
      "input",
      options.checked ? { type: "checkbox", checked: "" } : { type: "checkbox" }
    )
    addElement2(container, checkbox)
    const switchElm = createElement("span", { class: "switch" })
    addElement2(switchElm, "span", { class: "slider" })
    addElement2(container, switchElm)
    if (options.onchange) {
      addEventListener(checkbox, "change", options.onchange)
    }
    return container
  }
  function createSwitchOption(text, options) {
    const div = createElement("div", { class: "switch_option" })
    addElement2(div, "span", { textContent: text })
    div.append(createSwitch(options))
    return div
  }
  var settingsElementId =
    "browser_extension_settings_" + String(Math.round(Math.random() * 1e4))
  var getSettingsElement = () => $("#" + settingsElementId)
  var getSettingsStyle = () =>
    style_default.replace(/browser_extension_settings/gm, settingsElementId)
  var storageKey = "settings"
  var settingsOptions = {}
  var settingsTable = {}
  var settings = {}
  async function getSettings() {
    var _a
    return (_a = await getValue(storageKey)) != null ? _a : {}
  }
  async function saveSattingsValue(key, value) {
    const settings2 = await getSettings()
    settings2[key] =
      settingsTable[key] && settingsTable[key].defaultValue === value
        ? void 0
        : value
    await setValue(storageKey, settings2)
  }
  function getSettingsValue(key) {
    var _a
    return Object.hasOwn(settings, key)
      ? settings[key]
      : (_a = settingsTable[key]) == null
      ? void 0
      : _a.defaultValue
  }
  var modalHandler = (event) => {
    let target = event.target
    const settingsLayer = getSettingsElement()
    if (settingsLayer) {
      while (target !== settingsLayer && target) {
        target = target.parentNode
      }
      if (target === settingsLayer) {
        return
      }
      settingsLayer.style.display = "none"
    }
    removeEventListener(document, "click", modalHandler)
  }
  async function updateOptions() {
    if (!getSettingsElement()) {
      return
    }
    for (const key in settingsTable) {
      if (Object.hasOwn(settingsTable, key)) {
        const checkbox = $(
          `#${settingsElementId} .option_groups .switch_option[data-key="${key}"] input`
        )
        if (checkbox) {
          checkbox.checked = getSettingsValue(key)
        }
      }
    }
    const host2 = location.host
    const group2 = $(`#${settingsElementId} .option_groups:nth-of-type(2)`)
    if (group2) {
      group2.style.display = getSettingsValue(
        `enableCustomRulesForCurrentSite_${host2}`
      )
        ? "block"
        : "none"
    }
    const customStyleValue = $(`#${settingsElementId} .option_groups textarea`)
    if (customStyleValue) {
      customStyleValue.value =
        settings[`customRulesForCurrentSite_${host2}`] || ""
    }
  }
  function createSettingsElement() {
    let settingsLayer = getSettingsElement()
    if (!settingsLayer) {
      addStyle2(getSettingsStyle())
      settingsLayer = addElement2(document.body, "div", {
        id: settingsElementId,
      })
      if (settingsOptions.title) {
        addElement2(settingsLayer, "h2", { textContent: settingsOptions.title })
      }
      const options = addElement2(settingsLayer, "div", {
        class: "option_groups",
      })
      for (const key in settingsTable) {
        if (Object.hasOwn(settingsTable, key)) {
          const item = settingsTable[key]
          if (!item.type || item.type === "switch") {
            const switchOption = createSwitchOption(item.title, {
              async onchange(event) {
                await saveSattingsValue(key, event.target.checked)
              },
            })
            switchOption.dataset.key = key
            addElement2(options, switchOption)
          }
        }
      }
      const options2 = addElement2(settingsLayer, "div", {
        class: "option_groups",
      })
      let timeoutId
      addElement2(options2, "textarea", {
        placeholder: `/* Custom rules for internal URLs, matching URLs will be opened in new tabs */`,
        onkeyup(event) {
          if (timeoutId) {
            clearTimeout(timeoutId)
            timeoutId = null
          }
          timeoutId = setTimeout(async () => {
            const host2 = location.host
            await saveSattingsValue(
              `customRulesForCurrentSite_${host2}`,
              event.target.value.trim()
            )
          }, 100)
        },
      })
      const tip = addElement2(options2, "div", {
        class: "tip",
      })
      addElement2(tip, "a", {
        class: "tip_anchor",
        textContent: "Examples",
      })
      const tipContent = addElement2(tip, "div", {
        class: "tip_content",
        innerHTML: `<p>Custom rules for internal URLs, matching URLs will be opened in new tabs</p>
      <p>
      - One line per url pattern<br>
      - All URLs contains '/posts' or '/users/'<br>
      <pre>/posts/
/users/</pre>
      - Regex is supported<br>
      <pre>^/(posts|members)/d+</pre>
      - '*' for all URLs
      </p>`,
      })
      if (settingsOptions.footer) {
        const footer = addElement2(settingsLayer, "footer")
        footer.innerHTML =
          typeof settingsOptions.footer === "string"
            ? settingsOptions.footer
            : `<p>Made with \u2764\uFE0F by
      <a href="https://www.pipecraft.net/" target="_blank">
        Pipecraft
      </a></p>`
      }
    }
    return settingsLayer
  }
  async function showSettings() {
    const settingsLayer = createSettingsElement()
    await updateOptions()
    settingsLayer.style.display = "block"
    addEventListener(document, "click", modalHandler)
  }
  var initSettings = async (options) => {
    settingsOptions = options
    settingsTable = options.settingsTable || {}
    addValueChangeListener(storageKey, async () => {
      settings = await getSettings()
      await updateOptions()
    })
    settings = await getSettings()
  }
  var image_url_default =
    '{\n  "imgur.com": [\n    "https?://imgur.com/(\\\\w+)($|\\\\?) -> https://i.imgur.com/$1.png # ex: https://imgur.com/gi2b1rj",\n    "https?://imgur.com/(\\\\w+)\\\\.(\\\\w+) -> https://i.imgur.com/$1.$2 # ex: https://imgur.com/gi2b1rj.png"\n  ],\n  "imgur.io": [\n    "https?://imgur.io/(\\\\w+)($|\\\\?) -> https://i.imgur.com/$1.png # ex: https://imgur.io/gi2b1rj",\n    "https?://imgur.io/(\\\\w+)\\\\.(\\\\w+) -> https://i.imgur.com/$1.$2 # ex: https://imgur.io/gi2b1rj.png"\n  ],\n  "i.imgur.com": [\n    "https?://i.imgur.com/(\\\\w+)($|\\\\?) -> https://i.imgur.com/$1.png"\n  ],\n  "camo.githubusercontent.com": [\n    "https://camo.githubusercontent.com/.* # This is a img url, no need to replace value"\n  ]\n}\n'
  var rules = JSON.parse(image_url_default)
  var cachedRules = {}
  var getHostname = (url) => (/https?:\/\/([^/]+)/.exec(url) || [])[1]
  var processRule = (rule, href) => {
    var _a
    let pattern
    let replacement
    const cachedRule = cachedRules[rule]
    try {
      if (cachedRule) {
        pattern = cachedRule.pattern
        replacement = cachedRule.replacement
      } else {
        const result = rule.replace(/ #.*/, "").split("->")
        const patternString = result[0].trim()
        pattern = new RegExp(
          patternString.startsWith("http")
            ? "^" + patternString
            : patternString,
          "i"
        )
        replacement = (_a = result[1]) == null ? void 0 : _a.trim()
        cachedRules[rule] = { pattern, replacement }
      }
      if (pattern.test(href)) {
        return replacement ? href.replace(pattern, replacement) : href
      }
    } catch (error) {
      console.error(error)
    }
  }
  var convertImgUrl = (href) => {
    if (!href) {
      return
    }
    const hostname = getHostname(href)
    if (Object.hasOwn(rules, hostname)) {
      for (const rule of rules[hostname]) {
        const newHref = processRule(rule, href)
        if (newHref) {
          return newHref
        }
      }
    }
  }
  var createImgTagString = (src, text) =>
    `<img src="${src}" title="${text || "image"}" alt="${
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      text || "image"
    }" role="img" style="max-width: 100% !important; vertical-align: bottom;" loading="lazy" referrerpolicy="no-referrer" rel="noreferrer" data-lh-status="1"/>`
  var bindOnError = () => {
    for (const element of $$('img[data-lh-status="1"]')) {
      setAttribute(element, "data-lh-status", "2")
      addEventListener(element, "error", (event) => {
        const img = event.target
        const anchor = img.parentElement
        img.outerHTML = getAttribute(img, "src")
        if ((anchor == null ? void 0 : anchor.tagName) === "A") {
          setStyle(anchor, "opacity: 50%;")
          setAttribute(anchor, "data-message", "failed to load image")
        }
      })
    }
  }
  var anchorElementToImgElement = (anchor, href, text) => {
    anchor.innerHTML = createImgTagString(href, text)
    setAttribute(anchor, "target", "_blank")
    addAttribute(anchor, "rel", "noopener")
    addAttribute(anchor, "rel", "noreferrer")
  }
  var linkToImg = (anchor) => {
    if (
      !anchor ||
      anchor.childElementCount !== 0 ||
      (anchor.childNodes[0] && anchor.childNodes[0].nodeType !== 3)
    ) {
      return
    }
    const href = anchor.href
    const text = anchor.textContent || href
    const newHref = convertImgUrl(href)
    if (newHref) {
      anchorElementToImgElement(anchor, newHref, text)
    } else if (
      /^https:[^?]+\.(?:jpg|jpeg|jpe|bmp|png|gif|webp|ico|svg)/i.test(href)
    ) {
      anchorElementToImgElement(anchor, href, text)
    }
  }
  var ignoredTags = /* @__PURE__ */ new Set([
    "A",
    "BR",
    "BUTTON",
    "SVG",
    "PATH",
    "G",
    "SCRIPT",
    "STYLE",
    "TEXTAREA",
    "CODE",
    "PRE",
    "TEMPLATE",
    "NOSCRIPT",
    "TITLE",
  ])
  var urlPattern =
    "\\b((?:https?:\\/\\/(?:[\\w-.]+\\.[a-z]{2,15}|localhost|(?:\\d{1,3}\\.){3}\\d{1,3}))(?::\\d+)?(?:\\/[\\w-/%.~+:;!@=&?#]*)?)"
  var linkPattern1 = new RegExp(
    `!\\[([^\\[\\]]*)\\]\\((?:\\s|<br/?>)*${urlPattern}(?:\\s|<br/?>)*\\)`,
    "gim"
  )
  var linkPattern2 = new RegExp(
    `\\[([^\\[\\]]*)\\]\\((?:\\s|<br/?>)*${urlPattern}(?:\\s|<br/?>)*\\)`,
    "gim"
  )
  var linkPattern3 = new RegExp(urlPattern, "gim")
  var linkPattern4 = new RegExp(
    `\\[img\\](?:\\s|<br/?>)*${urlPattern}(?:\\s|<br/?>)*\\[/img\\]`,
    "gim"
  )
  var linkPattern5 = new RegExp(
    `\\[url\\](?:\\s|<br/?>)*${urlPattern}(?:\\s|<br/?>)*\\[/url\\]`,
    "gim"
  )
  var linkPattern6 = new RegExp(
    `\\[url=${urlPattern}\\]([^\\[\\]]+)\\[/url\\]`,
    "gim"
  )
  var replaceMarkdownImgLinks = (text) => {
    if (text.search(linkPattern1) >= 0) {
      text = text.replace(linkPattern1, (m, p1, p2) => {
        return createImgTagString(convertImgUrl(p2) || p2, p1)
      })
    }
    return text
  }
  var replaceMarkdownLinks = (text) => {
    if (text.search(linkPattern2) >= 0) {
      text = text.replace(linkPattern2, (m, p1, p2) => {
        return `<a href="${p2}">${p1}</a>`
      })
    }
    return text
  }
  var replaceTextLinks = (text) => {
    if (text.search(linkPattern3) >= 0) {
      text = text.replace(linkPattern3, (m, p1) => {
        return `<a href="${p1}">${p1}</a>`
      })
    }
    return text
  }
  var replaceBBCodeImgLinks = (text) => {
    if (text.search(linkPattern4) >= 0) {
      text = text.replace(linkPattern4, (m, p1) => {
        return createImgTagString(convertImgUrl(p1) || p1, p1)
      })
    }
    return text
  }
  var replaceBBCodeLinks = (text) => {
    if (text.search(linkPattern5) >= 0) {
      text = text.replace(linkPattern5, (m, p1) => {
        return `<a href="${p1}">${p1}</a>`
      })
    }
    if (text.search(linkPattern6) >= 0) {
      text = text.replace(linkPattern6, (m, p1, p2) => {
        return `<a href="${p1}">${p2}</a>`
      })
    }
    return text
  }
  var textToLink = (textNode) => {
    var _a
    const textContent = textNode.textContent
    const parentNode = textNode.parentNode
    if (
      !parentNode ||
      textNode.nodeName !== "#text" ||
      !textContent ||
      textContent.trim().length < 3
    ) {
      return
    }
    if (textContent.includes("://")) {
      const original = textContent
      let newContent = original
      if (/\[.*]\(/.test(original)) {
        newContent = replaceMarkdownImgLinks(newContent)
        newContent = replaceMarkdownLinks(newContent)
      }
      if (/\[(img|url)]|\[url=/.test(textContent)) {
        newContent = replaceBBCodeImgLinks(newContent)
        newContent = replaceBBCodeLinks(newContent)
      }
      if (newContent === original) {
        newContent = replaceTextLinks(original)
      } else {
        newContent = newContent.replace(
          new RegExp(
            "(<a(?:\\s[^<>]*)?>.*?<\\/a>)|(<img(?:\\s[^<>]*)?\\/?>)|(.+?(?=(?:<a|<img))|.+$)",
            "gims"
          ),
          (m, p1, p2) => (p1 || p2 ? m : replaceTextLinks(m))
        )
      }
      if (newContent !== original) {
        const span = createElement("span")
        span.innerHTML = newContent
        textNode.after(span)
        textNode.remove()
        return true
      }
    }
    const parentTextContent = (_a = parentNode.textContent) != null ? _a : ""
    if (
      /\[.*]\(/.test(textContent) &&
      (parentTextContent.search(linkPattern2) >= 0 ||
        $$("img", parentNode).length > 0)
    ) {
      const original = parentNode.innerHTML
      const newContent = original
        .replace(/\[.*]\([^[\]()]+?\)/gim, (m) =>
          m
            .replace(
              /<img[^<>]*\ssrc=['"]?(http[^'"]+)['"]?(\s[^<>]*)?>/gim,
              "$1"
            )
            .replace(
              /\((?:\s|<br\/?>)*<a[^<>]*\shref=['"]?(http[^'"]+)['"]?(\s[^<>]*)?>\1<\/a>(?:\s|<br\/?>)*\)/gim,
              "($1)"
            )
        )
        .replace(/\[!\[.*]\([^()]+\)]\([^[\]()]+?\)/gim, (m) =>
          m
            .replace(
              /<img[^<>]*\ssrc=['"]?(http[^'"]+)['"]?(\s[^<>]*)?>/gim,
              "$1"
            )
            .replace(
              /\((?:\s|<br\/?>)*<a[^<>]*\shref=['"]?(http[^'"]+)['"]?(\s[^<>]*)?>\1<\/a>(?:\s|<br\/?>)*\)/gim,
              "($1)"
            )
        )
      if (newContent !== original) {
        let newContent2 = replaceMarkdownImgLinks(newContent)
        newContent2 = replaceMarkdownLinks(newContent2)
        if (newContent2 !== newContent) {
          parentNode.innerHTML = newContent2
          return true
        }
      }
    }
    if (
      /\[(img|url)]|\[url=/.test(textContent) &&
      parentTextContent.search(/\[(img|url)[^\]]*]([^[\]]*?)\[\/\1]/) >= 0
    ) {
      const original = parentNode.innerHTML
      let before = ""
      let after = original
      let count = 0
      while (before !== after && count < 5) {
        count++
        before = after
        after = before.replace(
          /\[(img|url)[^\]]*]([^[\]]+?)\[\/\1]/gim,
          (m, p1) => {
            let tagsRemoved
            let converted
            if (p1 === "img") {
              tagsRemoved = m
                .replace(
                  /<img[^<>]*\ssrc=['"]?(http[^'"]+)['"]?(\s[^<>]*)?>/gim,
                  "$1"
                )
                .replace(
                  /\[img](?:\s|<br\/?>)*<a[^<>]*\shref=['"]?(http[^'"]+)['"]?(\s[^<>]*)?>\1<\/a>(?:\s|<br\/?>)*\[\/img]/gim,
                  "[img]$1[/img]"
                )
              converted = replaceBBCodeImgLinks(tagsRemoved)
            } else {
              tagsRemoved = m
                .replace(
                  /\[url](?:\s|<br\/?>)*<a[^<>]*\shref=['"]?(http[^'"]+)['"]?(\s[^<>]*)?>\1<\/a>(?:\s|<br\/?>)*\[\/url]/gim,
                  "[url]$1[/url]"
                )
                .replace(
                  /\[url=<a[^<>]*\shref=['"]?(http[^'"]+)['"]?(\s[^<>]*)?>\1<\/a>]/gim,
                  "[url=$1]"
                )
              converted = replaceBBCodeLinks(tagsRemoved)
            }
            return converted === tagsRemoved ? m : converted
          }
        )
      }
      const newContent = after
      if (newContent !== original) {
        parentNode.innerHTML = newContent
        return true
      }
    }
  }
  var fixAnchorTag = (anchorElement) => {
    const href = anchorElement.href
    const textContent = anchorElement.textContent
    const nextSibling = anchorElement.nextSibling
    if (
      anchorElement.childElementCount === 0 &&
      nextSibling &&
      nextSibling.nodeType === 3 &&
      href.includes(")") &&
      (textContent == null ? void 0 : textContent.includes(")"))
    ) {
      const index = textContent.indexOf(")")
      const removed = textContent.slice(Math.max(0, index))
      anchorElement.textContent = textContent.slice(0, Math.max(0, index))
      anchorElement.href = anchorElement.href.slice(
        0,
        Math.max(0, href.indexOf(")"))
      )
      nextSibling.textContent = removed + nextSibling.textContent
    }
  }
  var scanAndConvertChildNodes = (parentNode) => {
    if (
      !parentNode ||
      parentNode.nodeType === 8 ||
      !parentNode.tagName ||
      ignoredTags.has(parentNode.tagName.toUpperCase())
    ) {
      if (parentNode.tagName === "A") {
        fixAnchorTag(parentNode)
      }
      return
    }
    for (const child of parentNode.childNodes) {
      try {
        if (child.nodeName === "#text") {
          if (textToLink(child)) {
            scanAndConvertChildNodes(parentNode)
            break
          }
        } else {
          scanAndConvertChildNodes(child)
        }
      } catch (error) {
        console.error(error)
      }
    }
  }
  var origin = location.origin
  var host = location.host
  var config = {
    run_at: "document_start",
  }
  var settingsTable2 = {
    enable: {
      title: "Enable",
      defaultValue: true,
    },
    [`enableCurrentSite_${host}`]: {
      title: "Enable current site",
      defaultValue: true,
    },
    [`enableCustomRulesForCurrentSite_${host}`]: {
      title: "Enable custom rules for current site",
      defaultValue: false,
    },
    [`customRulesForCurrentSite_${host}`]: {
      title: "Enable custom rules for current site",
      defaultValue: "",
      type: "textarea",
    },
  }
  function registerMenuCommands() {
    registerMenuCommand("\u2699\uFE0F \u8BBE\u7F6E", showSettings, "o")
  }
  var getWithoutOrigin = (url) => url.replace(/(^https?:\/\/[^/]+)/, "")
  var shouldOpenInNewTab = (element) => {
    var _a
    const url = element.href
    if (
      !url ||
      !/^https?:\/\//.test(url) ||
      ((_a = element.getAttribute("href")) == null
        ? void 0
        : _a.startsWith("#"))
    ) {
      return false
    }
    if (element.origin !== origin) {
      return true
    }
    if (getSettingsValue(`enableCustomRulesForCurrentSite_${host}`)) {
      const rules2 = (
        getSettingsValue(`customRulesForCurrentSite_${host}`) || ""
      ).split("\n")
      if (rules2.includes("*")) {
        return true
      }
      const hrefWithoutOrigin = getWithoutOrigin(url)
      for (let rule of rules2) {
        rule = rule.trim()
        if (rule.length === 0) {
          continue
        }
        try {
          const regexp = new RegExp(rule)
          if (regexp.test(hrefWithoutOrigin)) {
            return true
          }
        } catch (error) {
          console.log(error.message)
          if (hrefWithoutOrigin.includes(rule)) {
            return true
          }
        }
      }
    }
  }
  var setAttributeAsOpenInNewTab = (element) => {
    if (shouldOpenInNewTab(element)) {
      setAttribute(element, "target", "_blank")
      addAttribute(element, "rel", "noopener")
    }
  }
  async function main() {
    await initSettings({
      title: "\u{1F517} Links Helper",
      footer: `
    <p>After change settings, reload the page to take effect</p>
    <p>
    <a href="https://github.com/utags/links-helper/issues" target="_blank">
    Report and Issue...
    </a></p>
    <p>Made with \u2764\uFE0F by
    <a href="https://www.pipecraft.net/" target="_blank">
      Pipecraft
    </a></p>`,
      settingsTable: settingsTable2,
    })
    registerMenuCommands()
    if (
      !getSettingsValue("enable") ||
      !getSettingsValue(`enableCurrentSite_${host}`)
    ) {
      return
    }
    addEventListener(
      document,
      "click",
      (event) => {
        let anchorElement = event.target
        while (anchorElement && anchorElement.tagName !== "A") {
          anchorElement = anchorElement.parentNode
        }
        if (anchorElement) {
          setAttributeAsOpenInNewTab(anchorElement)
          if (getAttribute(anchorElement, "target") === "_blank") {
            event.stopImmediatePropagation()
            event.stopPropagation()
          }
        }
      },
      true
    )
    const scanAnchors = () => {
      for (const element of $$("a")) {
        if (element.__links_helper_scaned) {
          continue
        }
        element.__links_helper_scaned = 1
        try {
          setAttributeAsOpenInNewTab(element)
        } catch (error) {
          console.error(error)
        }
        try {
          linkToImg(element)
        } catch (error) {
          console.error(error)
        }
      }
    }
    const scanNodes = throttle(() => {
      scanAndConvertChildNodes(doc.body)
      scanAnchors()
      bindOnError()
    }, 500)
    const observer = new MutationObserver(() => {
      scanNodes()
    })
    const startObserver = () => {
      observer.observe(doc.body, {
        childList: true,
        subtree: true,
        characterData: true,
      })
    }
    if (doc.body) {
      startObserver()
      scanAndConvertChildNodes(doc.body)
    } else {
      const intervalId = setInterval(() => {
        if (doc.body) {
          clearInterval(intervalId)
          startObserver()
          scanAndConvertChildNodes(doc.body)
        }
      }, 100)
    }
    scanAnchors()
  }
  main()
})()

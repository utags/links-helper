// ==UserScript==
// @name                 🔗 Links Helper
// @name:zh-CN           🔗 链接助手
// @namespace            https://github.com/utags/links-helper
// @homepageURL          https://github.com/utags/links-helper#readme
// @supportURL           https://github.com/utags/links-helper/issues
// @version              0.0.2
// @description          Open external links in a new tab, open links matching the specified rules in a new tab
// @description:zh-CN    支持所有网站在新标签页中打开第三方网站链接，在新标签页中打开符合指定规则的链接
// @icon                 data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTUnIGhlaWdodD0nMTUnIHZpZXdCb3g9JzAgMCAxNSAxNScgZmlsbD0nbm9uZScgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48cGF0aCBkPSdNMyAyQzIuNDQ3NzIgMiAyIDIuNDQ3NzIgMiAzVjEyQzIgMTIuNTUyMyAyLjQ0NzcyIDEzIDMgMTNIMTJDMTIuNTUyMyAxMyAxMyAxMi41NTIzIDEzIDEyVjguNUMxMyA4LjIyMzg2IDEyLjc3NjEgOCAxMi41IDhDMTIuMjIzOSA4IDEyIDguMjIzODYgMTIgOC41VjEySDNWM0w2LjUgM0M2Ljc3NjE0IDMgNyAyLjc3NjE0IDcgMi41QzcgMi4yMjM4NiA2Ljc3NjE0IDIgNi41IDJIM1pNMTIuODUzNiAyLjE0NjQ1QzEyLjkwMTUgMi4xOTQzOSAxMi45Mzc3IDIuMjQ5NjQgMTIuOTYyMSAyLjMwODYxQzEyLjk4NjEgMi4zNjY2OSAxMi45OTk2IDIuNDMwMyAxMyAyLjQ5N0wxMyAyLjVWMi41MDA0OVY1LjVDMTMgNS43NzYxNCAxMi43NzYxIDYgMTIuNSA2QzEyLjIyMzkgNiAxMiA1Ljc3NjE0IDEyIDUuNVYzLjcwNzExTDYuODUzNTUgOC44NTM1NUM2LjY1ODI5IDkuMDQ4ODIgNi4zNDE3MSA5LjA0ODgyIDYuMTQ2NDUgOC44NTM1NUM1Ljk1MTE4IDguNjU4MjkgNS45NTExOCA4LjM0MTcxIDYuMTQ2NDUgOC4xNDY0NUwxMS4yOTI5IDNIOS41QzkuMjIzODYgMyA5IDIuNzc2MTQgOSAyLjVDOSAyLjIyMzg2IDkuMjIzODYgMiA5LjUgMkgxMi40OTk5SDEyLjVDMTIuNTY3OCAyIDEyLjYzMjQgMi4wMTM0OSAxMi42OTE0IDIuMDM3OTRDMTIuNzUwNCAyLjA2MjM0IDEyLjgwNTYgMi4wOTg1MSAxMi44NTM2IDIuMTQ2NDVaJyBmaWxsPSdjdXJyZW50Q29sb3InIGZpbGwtcnVsZT0nZXZlbm9kZCcgY2xpcC1ydWxlPSdldmVub2RkJz48L3BhdGg+PC9zdmc+
// @author               Pipecraft
// @license              MIT
// @match                https://*/*
// @match                http://*/*
// @run-at               document-end
// @grant                GM_addElement
// @grant                GM_addStyle
// @grant                GM_registerMenuCommand
// @grant                GM_getValue
// @grant                GM_setValue
// @grant                GM_addValueChangeListener
// @grant                GM_removeValueChangeListener
// ==/UserScript==
//
//// Recent Updates
//// - 0.0.2 2023.04.22
////    - Add settings menu
////    - Enable/Disable userscript
////    - Enable/Disable current site
////
;(() => {
  "use strict"
  var doc = document
  var $ = (element, selectors) =>
    element && typeof element === "object"
      ? element.querySelector(selectors)
      : doc.querySelector(element)
  var $$ = (element, selectors) =>
    element && typeof element === "object"
      ? [...element.querySelectorAll(selectors)]
      : [...doc.querySelectorAll(element)]
  var createElement = (tagName, attributes) =>
    setAttributes(doc.createElement(tagName), attributes)
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
  if (typeof Object.hasOwn !== "function") {
    Object.hasOwn = (instance, prop) =>
      Object.prototype.hasOwnProperty.call(instance, prop)
  }
  var addElement = (parentNode, tagName, attributes) => {
    if (typeof parentNode === "string" || typeof tagName === "string") {
      const element = GM_addElement(parentNode, tagName, attributes)
      setAttributes(element, attributes)
      return element
    }
    setAttributes(tagName, attributes)
    parentNode.append(tagName)
    return tagName
  }
  var addStyle = (styleText) => GM_addStyle(styleText)
  var registerMenuCommand = (name, callback, accessKey) =>
    window === top && GM_registerMenuCommand(name, callback, accessKey)
  var getValue = (key) => {
    const value = GM_getValue(key)
    return value && value !== "undefined" ? JSON.parse(value) : void 0
  }
  var setValue = (key, value) => {
    if (value !== void 0) GM_setValue(key, JSON.stringify(value))
  }
  var addValueChangeListener = (key, func) => {
    const listenerId = GM_addValueChangeListener(key, func)
    return () => {
      GM_removeValueChangeListener(listenerId)
    }
  }
  var style_default =
    "#browser_extension_settings{--browser-extension-settings-background-color: #f3f3f3;--browser-extension-settings-text-color: #444444;position:fixed;top:10px;right:30px;min-width:250px;max-height:90%;overflow-y:auto;overflow-x:hidden;display:none;box-sizing:border-box;padding:10px 15px;background-color:var(--browser-extension-settings-background-color);color:var(--browser-extension-settings-text-color);z-index:100000;border-radius:5px;-webkit-box-shadow:0px 10px 39px 10px rgba(62,66,66,.22);-moz-box-shadow:0px 10px 39px 10px rgba(62,66,66,.22);box-shadow:0px 10px 39px 10px rgba(62,66,66,.22) !important}#browser_extension_settings h2{text-align:center;margin:5px 0 0;font-size:18px;font-weight:600;border:none}#browser_extension_settings footer{display:flex;justify-content:center;flex-direction:column;font-size:11px;margin:10px auto 0px;background-color:var(--browser-extension-settings-background-color);color:var(--browser-extension-settings-text-color)}#browser_extension_settings footer a{color:#217dfc;text-decoration:none;padding:0}#browser_extension_settings footer p{text-align:center;padding:0;margin:2px;line-height:13px}#browser_extension_settings .option_groups{background-color:#fff;padding:6px 0 6px 15px;border-radius:10px;display:flex;flex-direction:column;margin:10px 0 0}#browser_extension_settings .option_groups .action{font-size:14px;border-top:1px solid #ccc;padding:6px 15px 6px 0;color:#217dfc;cursor:pointer}#browser_extension_settings .option_groups:nth-of-type(2){display:none}#browser_extension_settings .option_groups textarea{margin:10px 15px 10px 0;height:200px;width:300px;border:1px solid #a9a9a9}#browser_extension_settings .switch_option{display:flex;justify-content:space-between;align-items:center;border-top:1px solid #ccc;padding:6px 15px 6px 0;font-size:14px}#browser_extension_settings .switch_option:first-of-type,#browser_extension_settings .option_groups .action:first-of-type{border-top:none}#browser_extension_settings .container{--button-width: 51px;--button-height: 24px;--toggle-diameter: 20px;--color-off: #e9e9eb;--color-on: #34c759;width:var(--button-width);height:var(--button-height);position:relative;padding:0;margin:0;flex:none}#browser_extension_settings input[type=checkbox]{opacity:0;width:0;height:0;position:absolute}#browser_extension_settings .switch{width:100%;height:100%;display:block;background-color:var(--color-off);border-radius:calc(var(--button-height)/2);cursor:pointer;transition:all .2s ease-out}#browser_extension_settings .slider{width:var(--toggle-diameter);height:var(--toggle-diameter);position:absolute;left:2px;top:calc(50% - var(--toggle-diameter)/2);border-radius:50%;background:#fff;box-shadow:0px 3px 8px rgba(0,0,0,.15),0px 3px 1px rgba(0,0,0,.06);transition:all .2s ease-out;cursor:pointer}#browser_extension_settings input[type=checkbox]:checked+.switch{background-color:var(--color-on)}#browser_extension_settings input[type=checkbox]:checked+.switch .slider{left:calc(var(--button-width) - var(--toggle-diameter) - 2px)}"
  function createSwitch(options = {}) {
    const container = createElement("label", { class: "container" })
    const checkbox = createElement(
      "input",
      options.checked ? { type: "checkbox", checked: "" } : { type: "checkbox" }
    )
    addElement(container, checkbox)
    const switchElm = createElement("span", { class: "switch" })
    addElement(switchElm, "span", { class: "slider" })
    addElement(container, switchElm)
    if (options.onchange) {
      addEventListener(checkbox, "change", options.onchange)
    }
    return container
  }
  function createSwitchOption(text, options) {
    const div = createElement("div", { class: "switch_option" })
    addElement(div, "span", { textContent: text })
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
    settings2[key] = value
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
  }
  function createSettingsElement() {
    let settingsLayer = getSettingsElement()
    if (!settingsLayer) {
      addStyle(getSettingsStyle())
      settingsLayer = addElement(document.body, "div", {
        id: settingsElementId,
      })
      if (settingsOptions.title) {
        addElement(settingsLayer, "h2", { textContent: settingsOptions.title })
      }
      const options = addElement(settingsLayer, "div", {
        class: "option_groups",
      })
      for (const key in settingsTable) {
        if (Object.hasOwn(settingsTable, key)) {
          const item = settingsTable[key]
          const switchOption = createSwitchOption(item.title, {
            async onchange(event) {
              await saveSattingsValue(key, event.target.checked)
            },
          })
          switchOption.dataset.key = key
          addElement(options, switchOption)
        }
      }
      if (settingsOptions.footer) {
        const footer = addElement(settingsLayer, "footer")
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
  var origin = location.origin
  var host = location.host
  var config = {
    run_at: "document_end",
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
  }
  function registerMenuCommands() {
    registerMenuCommand("\u2699\uFE0F \u8BBE\u7F6E", showSettings, "o")
  }
  var addAttribute = (element, name, value) => {
    const orgValue = getAttribute(element, name)
    if (!orgValue) {
      setAttribute(element, name, value)
    } else if (!orgValue.includes(value)) {
      setAttribute(element, name, orgValue + " " + value)
    }
  }
  var getOrigin = (url) => {
    var _a
    return (_a = /(^https?:\/\/[^/]+)/.exec(url)) == null ? void 0 : _a[1]
  }
  var shouldOpenInNewTab = (url) => {
    if (!url || !/^https?:\/\//.test(url)) {
      return false
    }
    if (getOrigin(url) !== origin) {
      return true
    }
  }
  var setAttributeAsOpenInNewTab = (element) => {
    const href = element.href
    if (shouldOpenInNewTab(href)) {
      setAttribute(element, "target", "_blank")
      addAttribute(element, "rel", "noopener")
    }
  }
  async function main() {
    await initSettings({
      title: "\u{1F517} Links Helper",
      footer: `
    <p>Reload the page to take effect</p>
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
      !getSettingsValue(`enableThisSite_${host}`)
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
        }
      },
      true
    )
    for (const element of $$("a")) {
      setAttributeAsOpenInNewTab(element)
    }
  }
  main()
})()

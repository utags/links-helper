// ==UserScript==
// @name                 🔗 Links Helper
// @name:zh-CN           🔗 链接助手
// @namespace            https://github.com/utags/links-helper
// @homepageURL          https://github.com/utags/links-helper#readme
// @supportURL           https://github.com/utags/links-helper/issues
// @version              0.6.3
// @description          Open external links in a new tab, open internal links matching the specified rules in a new tab, convert text to hyperlinks, convert image links to image tags(<img>), parse Markdown style links and image tags, parse BBCode style links and image tags
// @description:zh-CN    支持所有网站在新标签页中打开第三方网站链接（外链），在新标签页中打开符合指定规则的本站链接，解析文本链接为超链接，微信公众号文本转可点击的超链接，图片链接转图片标签，解析 Markdown 格式链接与图片标签，解析 BBCode 格式链接与图片标签
// @icon                 data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTUnIGhlaWdodD0nMTUnIHZpZXdCb3g9JzAgMCAxNSAxNScgZmlsbD0nbm9uZScgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48cGF0aCBkPSdNMyAyQzIuNDQ3NzIgMiAyIDIuNDQ3NzIgMiAzVjEyQzIgMTIuNTUyMyAyLjQ0NzcyIDEzIDMgMTNIMTJDMTIuNTUyMyAxMyAxMyAxMi41NTIzIDEzIDEyVjguNUMxMyA4LjIyMzg2IDEyLjc3NjEgOCAxMi41IDhDMTIuMjIzOSA4IDEyIDguMjIzODYgMTIgOC41VjEySDNWM0w2LjUgM0M2Ljc3NjE0IDMgNyAyLjc3NjE0IDcgMi41QzcgMi4yMjM4NiA2Ljc3NjE0IDIgNi41IDJIM1pNMTIuODUzNiAyLjE0NjQ1QzEyLjkwMTUgMi4xOTQzOSAxMi45Mzc3IDIuMjQ5NjQgMTIuOTYyMSAyLjMwODYxQzEyLjk4NjEgMi4zNjY2OSAxMi45OTk2IDIuNDMwMyAxMyAyLjQ5N0wxMyAyLjVWMi41MDA0OVY1LjVDMTMgNS43NzYxNCAxMi43NzYxIDYgMTIuNSA2QzEyLjIyMzkgNiAxMiA1Ljc3NjE0IDEyIDUuNVYzLjcwNzExTDYuODUzNTUgOC44NTM1NUM2LjY1ODI5IDkuMDQ4ODIgNi4zNDE3MSA5LjA0ODgyIDYuMTQ2NDUgOC44NTM1NUM1Ljk1MTE4IDguNjU4MjkgNS45NTExOCA4LjM0MTcxIDYuMTQ2NDUgOC4xNDY0NUwxMS4yOTI5IDNIOS41QzkuMjIzODYgMyA5IDIuNzc2MTQgOSAyLjVDOSAyLjIyMzg2IDkuMjIzODYgMiA5LjUgMkgxMi40OTk5SDEyLjVDMTIuNTY3OCAyIDEyLjYzMjQgMi4wMTM0OSAxMi42OTE0IDIuMDM3OTRDMTIuNzUwNCAyLjA2MjM0IDEyLjgwNTYgMi4wOTg1MSAxMi44NTM2IDIuMTQ2NDVaJyBmaWxsPSdjdXJyZW50Q29sb3InIGZpbGwtcnVsZT0nZXZlbm9kZCcgY2xpcC1ydWxlPSdldmVub2RkJz48L3BhdGg+PC9zdmc+
// @author               Pipecraft
// @license              MIT
// @match                https://*/*
// @match                http://*/*
// @exclude              *://github.dev/*
// @exclude              *://challenges.cloudflare.com/*
// @exclude              *://js.stripe.com/*
// @exclude              *://m.stripe.network/*
// @exclude              *://www.googletagmanager.com/*
// @exclude              *://googleads.g.doubleclick.net/*
// @exclude              *://ep2.adtrafficquality.google/*
// @exclude              *://www.google.com/recaptcha/*
// @run-at               document-start
// @grant                GM.getValue
// @grant                GM.setValue
// @grant                GM_addValueChangeListener
// @grant                GM_removeValueChangeListener
// @grant                GM_addElement
// @grant                GM.registerMenuCommand
// ==/UserScript==
//
;(() => {
  "use strict"
  var listeners = {}
  var getValue = async (key) => {
    const value = await GM.getValue(key)
    return value && value !== "undefined" ? JSON.parse(value) : void 0
  }
  var setValue = async (key, value) => {
    if (value !== void 0) {
      const newValue = JSON.stringify(value)
      if (listeners[key]) {
        const oldValue = await GM.getValue(key)
        await GM.setValue(key, newValue)
        if (newValue !== oldValue) {
          for (const func of listeners[key]) {
            func(key, oldValue, newValue)
          }
        }
      } else {
        await GM.setValue(key, newValue)
      }
    }
  }
  var _addValueChangeListener = (key, func) => {
    listeners[key] = listeners[key] || []
    listeners[key].push(func)
    return () => {
      if (listeners[key] && listeners[key].length > 0) {
        for (let i3 = listeners[key].length - 1; i3 >= 0; i3--) {
          if (listeners[key][i3] === func) {
            listeners[key].splice(i3, 1)
          }
        }
      }
    }
  }
  var addValueChangeListener = (key, func) => {
    if (typeof GM_addValueChangeListener !== "function") {
      console.warn("Do not support GM_addValueChangeListener!")
      return _addValueChangeListener(key, func)
    }
    const listenerId = GM_addValueChangeListener(key, func)
    return () => {
      GM_removeValueChangeListener(listenerId)
    }
  }
  var doc = document
  if (typeof String.prototype.replaceAll !== "function") {
    String.prototype.replaceAll = String.prototype.replace
  }
  var $ = (selectors, element) => (element || doc).querySelector(selectors)
  var $$ = (selectors, element) => [
    ...(element || doc).querySelectorAll(selectors),
  ]
  var getRootElement = (type) =>
    type === 1
      ? doc.head || doc.body || doc.documentElement
      : type === 2
      ? doc.body || doc.documentElement
      : doc.documentElement
  var createElement = (tagName, attributes) =>
    setAttributes(doc.createElement(tagName), attributes)
  var addElement = (parentNode, tagName, attributes) => {
    if (typeof parentNode === "string") {
      return addElement(null, parentNode, tagName)
    }
    if (!tagName) {
      return
    }
    if (!parentNode) {
      parentNode = /^(script|link|style|meta)$/.test(tagName)
        ? getRootElement(1)
        : getRootElement(2)
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
          if (/^(value|textContent|innerText)$/.test(name)) {
            element[name] = value
          } else if (/^(innerHTML)$/.test(name)) {
            element[name] = createHTML(value)
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
  var addClass = (element, className) => {
    if (!element || !element.classList) {
      return
    }
    element.classList.add(className)
  }
  var removeClass = (element, className) => {
    if (!element || !element.classList) {
      return
    }
    element.classList.remove(className)
  }
  var hasClass = (element, className) => {
    if (!element || !element.classList) {
      return false
    }
    return element.classList.contains(className)
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
  var parseInt10 = (number, defaultValue) => {
    if (typeof number === "number" && !Number.isNaN(number)) {
      return number
    }
    if (typeof defaultValue !== "number") {
      defaultValue = Number.NaN
    }
    if (!number) {
      return defaultValue
    }
    const result = Number.parseInt(number, 10)
    return Number.isNaN(result) ? defaultValue : result
  }
  var rootFuncArray = []
  var headFuncArray = []
  var bodyFuncArray = []
  var headBodyObserver
  var startObserveHeadBodyExists = () => {
    if (headBodyObserver) {
      return
    }
    headBodyObserver = new MutationObserver(() => {
      if (doc.head && doc.body) {
        headBodyObserver.disconnect()
      }
      if (doc.documentElement && rootFuncArray.length > 0) {
        for (const func of rootFuncArray) {
          func()
        }
        rootFuncArray.length = 0
      }
      if (doc.head && headFuncArray.length > 0) {
        for (const func of headFuncArray) {
          func()
        }
        headFuncArray.length = 0
      }
      if (doc.body && bodyFuncArray.length > 0) {
        for (const func of bodyFuncArray) {
          func()
        }
        bodyFuncArray.length = 0
      }
    })
    headBodyObserver.observe(doc, {
      childList: true,
      subtree: true,
    })
  }
  var runWhenHeadExists = (func) => {
    if (!doc.head) {
      headFuncArray.push(func)
      startObserveHeadBodyExists()
      return
    }
    func()
  }
  var runWhenBodyExists = (func) => {
    if (!doc.body) {
      bodyFuncArray.push(func)
      startObserveHeadBodyExists()
      return
    }
    func()
  }
  var runWhenDomReady = (func) => {
    if (doc.readyState === "interactive" || doc.readyState === "complete") {
      return func()
    }
    const handler = () => {
      if (doc.readyState === "interactive" || doc.readyState === "complete") {
        func()
        removeEventListener(doc, "readystatechange", handler)
      }
    }
    addEventListener(doc, "readystatechange", handler)
  }
  var escapeHTMLPolicy =
    typeof trustedTypes !== "undefined" &&
    typeof trustedTypes.createPolicy === "function"
      ? trustedTypes.createPolicy("beuEscapePolicy", {
          createHTML: (string) => string,
        })
      : void 0
  var createHTML = (html) => {
    return escapeHTMLPolicy ? escapeHTMLPolicy.createHTML(html) : html
  }
  var addElement2 =
    typeof GM_addElement === "function"
      ? (parentNode, tagName, attributes) => {
          if (typeof parentNode === "string") {
            return addElement2(null, parentNode, tagName)
          }
          if (!tagName) {
            return
          }
          if (!parentNode) {
            parentNode = /^(script|link|style|meta)$/.test(tagName)
              ? getRootElement(1)
              : getRootElement(2)
          }
          if (typeof tagName === "string") {
            let attributes2
            if (attributes) {
              const entries1 = []
              const entries2 = []
              for (const entry of Object.entries(attributes)) {
                if (/^(on\w+|innerHTML)$/.test(entry[0])) {
                  entries2.push(entry)
                } else {
                  entries1.push(entry)
                }
              }
              attributes = Object.fromEntries(entries1)
              attributes2 = Object.fromEntries(entries2)
            }
            const element = GM_addElement(null, tagName, attributes)
            setAttributes(element, attributes2)
            parentNode.append(element)
            return element
          }
          setAttributes(tagName, attributes)
          parentNode.append(tagName)
          return tagName
        }
      : addElement
  var addStyle = (styleText) =>
    addElement2(null, "style", { textContent: styleText })
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
  var style_default =
    '#browser_extension_settings_container{--browser-extension-settings-background-color: #f2f2f7;--browser-extension-settings-text-color: #444444;--browser-extension-settings-link-color: #217dfc;--sb-track-color: #00000000;--sb-thumb-color: #33334480;--sb-size: 2px;--font-family: "helvetica neue", "microsoft yahei", arial, sans-serif;position:fixed;top:10px;right:30px;max-height:90%;height:600px;overflow:hidden;display:none;z-index:100000;border-radius:5px;-webkit-box-shadow:0px 10px 39px 10px rgba(62,66,66,.22);-moz-box-shadow:0px 10px 39px 10px rgba(62,66,66,.22);box-shadow:0px 10px 39px 10px rgba(62,66,66,.22) !important}#browser_extension_settings_container .browser_extension_settings_wrapper{display:flex;height:100%;overflow:hidden;background-color:var(--browser-extension-settings-background-color);font-family:var(--font-family)}#browser_extension_settings_container .browser_extension_settings_wrapper h1,#browser_extension_settings_container .browser_extension_settings_wrapper h2{border:none;color:var(--browser-extension-settings-text-color);padding:0;font-family:var(--font-family);line-height:normal;letter-spacing:normal}#browser_extension_settings_container .browser_extension_settings_wrapper h1{font-size:26px;font-weight:800;margin:18px 0}#browser_extension_settings_container .browser_extension_settings_wrapper h2{font-size:18px;font-weight:600;margin:14px 0}#browser_extension_settings_container .browser_extension_settings_wrapper footer{display:flex;justify-content:center;flex-direction:column;font-size:11px;margin:10px auto 0px;background-color:var(--browser-extension-settings-background-color);color:var(--browser-extension-settings-text-color);font-family:var(--font-family)}#browser_extension_settings_container .browser_extension_settings_wrapper footer a{color:var(--browser-extension-settings-link-color) !important;font-family:var(--font-family);text-decoration:none;padding:0}#browser_extension_settings_container .browser_extension_settings_wrapper footer p{text-align:center;padding:0;margin:2px;line-height:13px;font-size:11px;color:var(--browser-extension-settings-text-color);font-family:var(--font-family)}#browser_extension_settings_container .browser_extension_settings_wrapper a.navigation_go_previous{color:var(--browser-extension-settings-link-color);cursor:pointer;display:none}#browser_extension_settings_container .browser_extension_settings_wrapper a.navigation_go_previous::before{content:"< "}#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container{overflow-x:auto;box-sizing:border-box;padding:10px 15px;background-color:var(--browser-extension-settings-background-color);color:var(--browser-extension-settings-text-color)}#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .installed_extension_list div,#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .related_extension_list div{background-color:#fff;font-size:14px;border-top:1px solid #ccc;padding:6px 15px 6px 15px}#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .installed_extension_list div a,#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .installed_extension_list div a:visited,#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .related_extension_list div a,#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .related_extension_list div a:visited{display:flex;justify-content:space-between;align-items:center;cursor:pointer;text-decoration:none;color:var(--browser-extension-settings-text-color);font-family:var(--font-family)}#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .installed_extension_list div a:hover,#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .installed_extension_list div a:visited:hover,#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .related_extension_list div a:hover,#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .related_extension_list div a:visited:hover{text-decoration:none;color:var(--browser-extension-settings-text-color)}#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .installed_extension_list div a span,#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .installed_extension_list div a:visited span,#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .related_extension_list div a span,#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .related_extension_list div a:visited span{margin-right:10px;line-height:24px;font-family:var(--font-family)}#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .installed_extension_list div.active,#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .installed_extension_list div:hover,#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .related_extension_list div.active,#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .related_extension_list div:hover{background-color:#e4e4e6}#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .installed_extension_list div.active a,#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .related_extension_list div.active a{cursor:default}#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .installed_extension_list div:first-of-type,#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .related_extension_list div:first-of-type{border-top:none;border-top-right-radius:10px;border-top-left-radius:10px}#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .installed_extension_list div:last-of-type,#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .related_extension_list div:last-of-type{border-bottom-right-radius:10px;border-bottom-left-radius:10px}#browser_extension_settings_container .thin_scrollbar{scrollbar-color:var(--sb-thumb-color) var(--sb-track-color);scrollbar-width:thin}#browser_extension_settings_container .thin_scrollbar::-webkit-scrollbar{width:var(--sb-size)}#browser_extension_settings_container .thin_scrollbar::-webkit-scrollbar-track{background:var(--sb-track-color);border-radius:10px}#browser_extension_settings_container .thin_scrollbar::-webkit-scrollbar-thumb{background:var(--sb-thumb-color);border-radius:10px}#browser_extension_settings_main{min-width:250px;overflow-y:auto;overflow-x:hidden;box-sizing:border-box;padding:10px 15px;background-color:var(--browser-extension-settings-background-color);color:var(--browser-extension-settings-text-color);font-family:var(--font-family)}#browser_extension_settings_main h2{text-align:center;margin:5px 0 0}#browser_extension_settings_main .option_groups{background-color:#fff;padding:6px 15px 6px 15px;border-radius:10px;display:flex;flex-direction:column;margin:10px 0 0}#browser_extension_settings_main .option_groups .action{font-size:14px;padding:6px 0 6px 0;color:var(--browser-extension-settings-link-color);cursor:pointer}#browser_extension_settings_main .bes_external_link{font-size:14px;padding:6px 0 6px 0}#browser_extension_settings_main .bes_external_link a,#browser_extension_settings_main .bes_external_link a:visited,#browser_extension_settings_main .bes_external_link a:hover{color:var(--browser-extension-settings-link-color);font-family:var(--font-family);text-decoration:none;cursor:pointer}#browser_extension_settings_main .option_groups textarea{font-size:12px;margin:10px 0 10px 0;height:100px;width:100%;border:1px solid #a9a9a9;border-radius:4px;box-sizing:border-box}#browser_extension_settings_main .switch_option,#browser_extension_settings_main .select_option{display:flex;justify-content:space-between;align-items:center;padding:6px 0 6px 0;font-size:14px}#browser_extension_settings_main .option_groups>*{border-top:1px solid #ccc}#browser_extension_settings_main .option_groups>*:first-child{border-top:none}#browser_extension_settings_main .bes_option>.bes_icon{width:24px;height:24px;margin-right:10px}#browser_extension_settings_main .bes_option>.bes_title{margin-right:10px;flex-grow:1}#browser_extension_settings_main .bes_option>.bes_select{box-sizing:border-box;background-color:#fff;height:24px;padding:0 2px 0 2px;margin:0;border-radius:6px;border:1px solid #ccc}#browser_extension_settings_main .option_groups .bes_tip{position:relative;margin:0;padding:0 15px 0 0;border:none;max-width:none;font-size:14px}#browser_extension_settings_main .option_groups .bes_tip .bes_tip_anchor{cursor:help;text-decoration:underline}#browser_extension_settings_main .option_groups .bes_tip .bes_tip_content{position:absolute;bottom:15px;left:0;background-color:#fff;color:var(--browser-extension-settings-text-color);text-align:left;padding:10px;display:none;border-radius:5px;-webkit-box-shadow:0px 10px 39px 10px rgba(62,66,66,.22);-moz-box-shadow:0px 10px 39px 10px rgba(62,66,66,.22);box-shadow:0px 10px 39px 10px rgba(62,66,66,.22) !important}#browser_extension_settings_main .option_groups .bes_tip .bes_tip_anchor:hover+.bes_tip_content,#browser_extension_settings_main .option_groups .bes_tip .bes_tip_content:hover{display:block}#browser_extension_settings_main .option_groups .bes_tip p,#browser_extension_settings_main .option_groups .bes_tip pre{margin:revert;padding:revert}#browser_extension_settings_main .option_groups .bes_tip pre{font-family:Consolas,panic sans,bitstream vera sans mono,Menlo,microsoft yahei,monospace;font-size:13px;letter-spacing:.015em;line-height:120%;white-space:pre;overflow:auto;background-color:#f5f5f5;word-break:normal;overflow-wrap:normal;padding:.5em;border:none}#browser_extension_settings_main .bes_switch_container{--button-width: 51px;--button-height: 24px;--toggle-diameter: 20px;--color-off: #e9e9eb;--color-on: #34c759;width:var(--button-width);height:var(--button-height);position:relative;padding:0;margin:0;flex:none;user-select:none}#browser_extension_settings_main input[type=checkbox]{opacity:0;width:0;height:0;position:absolute}#browser_extension_settings_main .bes_switch{width:100%;height:100%;display:block;background-color:var(--color-off);border-radius:calc(var(--button-height)/2);border:none;cursor:pointer;transition:all .2s ease-out}#browser_extension_settings_main .bes_switch::before{display:none}#browser_extension_settings_main .bes_slider{width:var(--toggle-diameter);height:var(--toggle-diameter);position:absolute;left:2px;top:calc(50% - var(--toggle-diameter)/2);border-radius:50%;background:#fff;box-shadow:0px 3px 8px rgba(0,0,0,.15),0px 3px 1px rgba(0,0,0,.06);transition:all .2s ease-out;cursor:pointer}#browser_extension_settings_main input[type=checkbox]:checked+.bes_switch{background-color:var(--color-on)}#browser_extension_settings_main input[type=checkbox]:checked+.bes_switch .bes_slider{left:calc(var(--button-width) - var(--toggle-diameter) - 2px)}#browser_extension_side_menu{min-height:80px;width:30px;opacity:0;position:fixed;top:80px;right:0;padding-top:20px;z-index:10000}#browser_extension_side_menu:hover{opacity:1}#browser_extension_side_menu button{cursor:pointer;width:24px;height:24px;padding:0;border:none;background-color:rgba(0,0,0,0);background-image:none}#browser_extension_side_menu button svg{width:24px;height:24px}#browser_extension_side_menu button:hover{opacity:70%}#browser_extension_side_menu button:active{opacity:100%}@media(max-width: 500px){#browser_extension_settings_container{right:10px}#browser_extension_settings_container .browser_extension_settings_wrapper a.navigation_go_previous{display:block}#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container{display:none}#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container.bes_active{display:block}#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container.bes_active+div{display:none}}'
  function createSwitch(options = {}) {
    const container = createElement("label", { class: "bes_switch_container" })
    const checkbox = createElement(
      "input",
      options.checked ? { type: "checkbox", checked: "" } : { type: "checkbox" }
    )
    addElement2(container, checkbox)
    const switchElm = createElement("span", { class: "bes_switch" })
    addElement2(switchElm, "span", { class: "bes_slider" })
    addElement2(container, switchElm)
    if (options.onchange) {
      addEventListener(checkbox, "change", options.onchange)
    }
    return container
  }
  function createSwitchOption(icon, text, options) {
    if (typeof text !== "string") {
      return createSwitchOption(void 0, icon, text)
    }
    const div = createElement("div", { class: "switch_option bes_option" })
    if (icon) {
      addElement2(div, "img", { src: icon, class: "bes_icon" })
    }
    addElement2(div, "span", { textContent: text, class: "bes_title" })
    div.append(createSwitch(options))
    return div
  }
  var besVersion = 55
  var openButton =
    '<svg viewBox="0 0 60.2601318359375 84.8134765625" version="1.1" xmlns="http://www.w3.org/2000/svg" class=" glyph-box" style="height: 9.62969px; width: 6.84191px;"><g transform="matrix(1 0 0 1 -6.194965820312518 77.63671875)"><path d="M66.4551-35.2539C66.4551-36.4746 65.9668-37.5977 65.0391-38.4766L26.3672-76.3672C25.4883-77.1973 24.4141-77.6367 23.1445-77.6367C20.6543-77.6367 18.7012-75.7324 18.7012-73.1934C18.7012-71.9727 19.1895-70.8496 19.9707-70.0195L55.5176-35.2539L19.9707-0.488281C19.1895 0.341797 18.7012 1.41602 18.7012 2.68555C18.7012 5.22461 20.6543 7.12891 23.1445 7.12891C24.4141 7.12891 25.4883 6.68945 26.3672 5.81055L65.0391-32.0312C65.9668-32.959 66.4551-34.0332 66.4551-35.2539Z"></path></g></svg>'
  var openInNewTabButton =
    '<svg viewBox="0 0 72.127685546875 72.2177734375" version="1.1" xmlns="http://www.w3.org/2000/svg" class=" glyph-box" style="height: 8.19958px; width: 8.18935px;"><g transform="matrix(1 0 0 1 -12.451127929687573 71.3388671875)"><path d="M84.5703-17.334L84.5215-66.4551C84.5215-69.2383 82.7148-71.1914 79.7852-71.1914L30.6641-71.1914C27.9297-71.1914 26.0742-69.0918 26.0742-66.748C26.0742-64.4043 28.1738-62.4023 30.4688-62.4023L47.4609-62.4023L71.2891-63.1836L62.207-55.2246L13.8184-6.73828C12.9395-5.85938 12.4512-4.73633 12.4512-3.66211C12.4512-1.31836 14.5508 0.878906 16.9922 0.878906C18.1152 0.878906 19.1895 0.488281 20.0684-0.439453L68.5547-48.877L76.6113-58.0078L75.7324-35.2051L75.7324-17.1387C75.7324-14.8438 77.7344-12.6953 80.127-12.6953C82.4707-12.6953 84.5703-14.6973 84.5703-17.334Z"></path></g></svg>'
  var settingButton =
    '<svg viewBox="0 0 16 16" version="1.1">\n<path d="M8 0a8.2 8.2 0 0 1 .701.031C9.444.095 9.99.645 10.16 1.29l.288 1.107c.018.066.079.158.212.224.231.114.454.243.668.386.123.082.233.09.299.071l1.103-.303c.644-.176 1.392.021 1.82.63.27.385.506.792.704 1.218.315.675.111 1.422-.364 1.891l-.814.806c-.049.048-.098.147-.088.294.016.257.016.515 0 .772-.01.147.038.246.088.294l.814.806c.475.469.679 1.216.364 1.891a7.977 7.977 0 0 1-.704 1.217c-.428.61-1.176.807-1.82.63l-1.102-.302c-.067-.019-.177-.011-.3.071a5.909 5.909 0 0 1-.668.386c-.133.066-.194.158-.211.224l-.29 1.106c-.168.646-.715 1.196-1.458 1.26a8.006 8.006 0 0 1-1.402 0c-.743-.064-1.289-.614-1.458-1.26l-.289-1.106c-.018-.066-.079-.158-.212-.224a5.738 5.738 0 0 1-.668-.386c-.123-.082-.233-.09-.299-.071l-1.103.303c-.644.176-1.392-.021-1.82-.63a8.12 8.12 0 0 1-.704-1.218c-.315-.675-.111-1.422.363-1.891l.815-.806c.05-.048.098-.147.088-.294a6.214 6.214 0 0 1 0-.772c.01-.147-.038-.246-.088-.294l-.815-.806C.635 6.045.431 5.298.746 4.623a7.92 7.92 0 0 1 .704-1.217c.428-.61 1.176-.807 1.82-.63l1.102.302c.067.019.177.011.3-.071.214-.143.437-.272.668-.386.133-.066.194-.158.211-.224l.29-1.106C6.009.645 6.556.095 7.299.03 7.53.01 7.764 0 8 0Zm-.571 1.525c-.036.003-.108.036-.137.146l-.289 1.105c-.147.561-.549.967-.998 1.189-.173.086-.34.183-.5.29-.417.278-.97.423-1.529.27l-1.103-.303c-.109-.03-.175.016-.195.045-.22.312-.412.644-.573.99-.014.031-.021.11.059.19l.815.806c.411.406.562.957.53 1.456a4.709 4.709 0 0 0 0 .582c.032.499-.119 1.05-.53 1.456l-.815.806c-.081.08-.073.159-.059.19.162.346.353.677.573.989.02.03.085.076.195.046l1.102-.303c.56-.153 1.113-.008 1.53.27.161.107.328.204.501.29.447.222.85.629.997 1.189l.289 1.105c.029.109.101.143.137.146a6.6 6.6 0 0 0 1.142 0c.036-.003.108-.036.137-.146l.289-1.105c.147-.561.549-.967.998-1.189.173-.086.34-.183.5-.29.417-.278.97-.423 1.529-.27l1.103.303c.109.029.175-.016.195-.045.22-.313.411-.644.573-.99.014-.031.021-.11-.059-.19l-.815-.806c-.411-.406-.562-.957-.53-1.456a4.709 4.709 0 0 0 0-.582c-.032-.499.119-1.05.53-1.456l.815-.806c.081-.08.073-.159.059-.19a6.464 6.464 0 0 0-.573-.989c-.02-.03-.085-.076-.195-.046l-1.102.303c-.56.153-1.113.008-1.53-.27a4.44 4.44 0 0 0-.501-.29c-.447-.222-.85-.629-.997-1.189l-.289-1.105c-.029-.11-.101-.143-.137-.146a6.6 6.6 0 0 0-1.142 0ZM11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM9.5 8a1.5 1.5 0 1 0-3.001.001A1.5 1.5 0 0 0 9.5 8Z"></path>\n</svg>'
  function initI18n(messageMaps, language) {
    language = (language || navigator.language).toLowerCase()
    const language2 = language.slice(0, 2)
    let messagesDefault
    let messagesLocal
    for (const entry of Object.entries(messageMaps)) {
      const langs = new Set(
        entry[0]
          .toLowerCase()
          .split(",")
          .map((v) => v.trim())
      )
      const value = entry[1]
      if (langs.has(language)) {
        messagesLocal = value
      }
      if (langs.has(language2) && !messagesLocal) {
        messagesLocal = value
      }
      if (langs.has("en")) {
        messagesDefault = value
      }
      if (langs.has("en-us") && !messagesDefault) {
        messagesDefault = value
      }
    }
    if (!messagesLocal) {
      messagesLocal = {}
    }
    if (!messagesDefault || messagesDefault === messagesLocal) {
      messagesDefault = {}
    }
    return function (key, ...parameters) {
      let text = messagesLocal[key] || messagesDefault[key] || key
      if (parameters && parameters.length > 0 && text !== key) {
        for (let i3 = 0; i3 < parameters.length; i3++) {
          text = text.replaceAll(
            new RegExp("\\{".concat(i3 + 1, "\\}"), "g"),
            String(parameters[i3])
          )
        }
      }
      return text
    }
  }
  var messages = {
    "settings.title": "Settings",
    "settings.otherExtensions": "Other Extensions",
    "settings.displaySettingsButtonInSideMenu":
      "Display Settings Button in Side Menu",
    "settings.menu.settings": "\u2699\uFE0F Settings",
    "settings.extensions.utags.title":
      "\u{1F3F7}\uFE0F UTags - Add usertags to links",
    "settings.extensions.links-helper.title": "\u{1F517} Links Helper",
    "settings.extensions.v2ex.rep.title":
      "V2EX.REP - \u4E13\u6CE8\u63D0\u5347 V2EX \u4E3B\u9898\u56DE\u590D\u6D4F\u89C8\u4F53\u9A8C",
    "settings.extensions.v2ex.min.title":
      "v2ex.min - V2EX Minimalist (\u6781\u7B80\u98CE\u683C)",
    "settings.extensions.replace-ugly-avatars.title": "Replace Ugly Avatars",
    "settings.extensions.more-by-pipecraft.title":
      "Find more useful userscripts",
  }
  var en_default = messages
  var messages2 = {
    "settings.title": "\u8BBE\u7F6E",
    "settings.otherExtensions": "\u5176\u4ED6\u6269\u5C55",
    "settings.displaySettingsButtonInSideMenu":
      "\u5728\u4FA7\u8FB9\u680F\u83DC\u5355\u4E2D\u663E\u793A\u8BBE\u7F6E\u6309\u94AE",
    "settings.menu.settings": "\u2699\uFE0F \u8BBE\u7F6E",
    "settings.extensions.utags.title":
      "\u{1F3F7}\uFE0F \u5C0F\u9C7C\u6807\u7B7E (UTags) - \u4E3A\u94FE\u63A5\u6DFB\u52A0\u7528\u6237\u6807\u7B7E",
    "settings.extensions.links-helper.title":
      "\u{1F517} \u94FE\u63A5\u52A9\u624B",
    "settings.extensions.v2ex.rep.title":
      "V2EX.REP - \u4E13\u6CE8\u63D0\u5347 V2EX \u4E3B\u9898\u56DE\u590D\u6D4F\u89C8\u4F53\u9A8C",
    "settings.extensions.v2ex.min.title":
      "v2ex.min - V2EX \u6781\u7B80\u98CE\u683C",
    "settings.extensions.replace-ugly-avatars.title":
      "\u8D50\u4F60\u4E2A\u5934\u50CF\u5427",
    "settings.extensions.more-by-pipecraft.title":
      "\u66F4\u591A\u6709\u8DA3\u7684\u811A\u672C",
  }
  var zh_cn_default = messages2
  var i = initI18n({
    "en,en-US": en_default,
    "zh,zh-CN": zh_cn_default,
  })
  var lang = navigator.language
  var locale
  if (lang === "zh-TW" || lang === "zh-HK") {
    locale = "zh-TW"
  } else if (lang.includes("zh")) {
    locale = "zh-CN"
  } else {
    locale = "en"
  }
  var relatedExtensions = [
    {
      id: "utags",
      title: i("settings.extensions.utags.title"),
      url: "https://greasyfork.org/".concat(
        locale,
        "/scripts/460718-utags-add-usertags-to-links"
      ),
    },
    {
      id: "links-helper",
      title: i("settings.extensions.links-helper.title"),
      description:
        "\u5728\u65B0\u6807\u7B7E\u9875\u4E2D\u6253\u5F00\u7B2C\u4E09\u65B9\u7F51\u7AD9\u94FE\u63A5\uFF0C\u56FE\u7247\u94FE\u63A5\u8F6C\u56FE\u7247\u6807\u7B7E\u7B49",
      url: "https://greasyfork.org/".concat(
        locale,
        "/scripts/464541-links-helper"
      ),
    },
    {
      id: "v2ex.rep",
      title: i("settings.extensions.v2ex.rep.title"),
      url: "https://greasyfork.org/".concat(
        locale,
        "/scripts/466589-v2ex-rep-%E4%B8%93%E6%B3%A8%E6%8F%90%E5%8D%87-v2ex-%E4%B8%BB%E9%A2%98%E5%9B%9E%E5%A4%8D%E6%B5%8F%E8%A7%88%E4%BD%93%E9%AA%8C"
      ),
    },
    {
      id: "v2ex.min",
      title: i("settings.extensions.v2ex.min.title"),
      url: "https://greasyfork.org/".concat(
        locale,
        "/scripts/463552-v2ex-min-v2ex-%E6%9E%81%E7%AE%80%E9%A3%8E%E6%A0%BC"
      ),
    },
    {
      id: "replace-ugly-avatars",
      title: i("settings.extensions.replace-ugly-avatars.title"),
      url: "https://greasyfork.org/".concat(
        locale,
        "/scripts/472616-replace-ugly-avatars"
      ),
    },
    {
      id: "more-by-pipecraft",
      title: i("settings.extensions.more-by-pipecraft.title"),
      url: "https://greasyfork.org/".concat(locale, "/users/1030884-pipecraft"),
    },
  ]
  var getInstalledExtesionList = () => {
    return $(".extension_list_container .installed_extension_list")
  }
  var getRelatedExtesionList = () => {
    return $(".extension_list_container .related_extension_list")
  }
  var isInstalledExtension = (id) => {
    const list = getInstalledExtesionList()
    if (!list) {
      return false
    }
    const installed = $('[data-extension-id="'.concat(id, '"]'), list)
    return Boolean(installed)
  }
  var addCurrentExtension = (extension) => {
    const list = getInstalledExtesionList()
    if (!list) {
      return
    }
    if (isInstalledExtension(extension.id)) {
      return
    }
    const element = createInstalledExtension(extension)
    list.append(element)
    const list2 = getRelatedExtesionList()
    if (list2) {
      updateRelatedExtensions(list2)
    }
  }
  var activeExtension = (id) => {
    const list = getInstalledExtesionList()
    if (!list) {
      return false
    }
    for (const element of $$(".active", list)) {
      removeClass(element, "active")
    }
    const installed = $('[data-extension-id="'.concat(id, '"]'), list)
    if (installed) {
      addClass(installed, "active")
    }
  }
  var activeExtensionList = () => {
    const extensionListContainer = $(".extension_list_container")
    if (extensionListContainer) {
      addClass(extensionListContainer, "bes_active")
    }
  }
  var deactiveExtensionList = () => {
    const extensionListContainer = $(".extension_list_container")
    if (extensionListContainer) {
      removeClass(extensionListContainer, "bes_active")
    }
  }
  var createInstalledExtension = (installedExtension) => {
    const div = createElement("div", {
      class: "installed_extension",
      "data-extension-id": installedExtension.id,
    })
    const a = addElement2(div, "a", {
      onclick: installedExtension.onclick,
    })
    addElement2(a, "span", {
      textContent: installedExtension.title,
    })
    const svg = addElement2(a, "svg")
    svg.outerHTML = createHTML(openButton)
    return div
  }
  var updateRelatedExtensions = (container) => {
    const relatedExtensionElements = $$("[data-extension-id]", container)
    if (relatedExtensionElements.length > 0) {
      for (const relatedExtensionElement of relatedExtensionElements) {
        if (
          isInstalledExtension(
            relatedExtensionElement.dataset.extensionId || "noid"
          )
        ) {
          relatedExtensionElement.remove()
        }
      }
    } else {
      container.innerHTML = createHTML("")
    }
    for (const relatedExtension of relatedExtensions) {
      if (
        isInstalledExtension(relatedExtension.id) ||
        $('[data-extension-id="'.concat(relatedExtension.id, '"]'), container)
      ) {
        continue
      }
      if ($$("[data-extension-id]", container).length >= 4) {
        return
      }
      const div4 = addElement2(container, "div", {
        class: "related_extension",
        "data-extension-id": relatedExtension.id,
      })
      const a = addElement2(div4, "a", {
        href: relatedExtension.url,
        target: "_blank",
      })
      addElement2(a, "span", {
        textContent: relatedExtension.title,
      })
      const svg = addElement2(a, "svg")
      svg.outerHTML = createHTML(openInNewTabButton)
    }
  }
  function createExtensionList(installedExtensions) {
    const div = createElement("div", {
      class: "extension_list_container thin_scrollbar",
    })
    addElement2(div, "h1", { textContent: i("settings.title") })
    const div2 = addElement2(div, "div", {
      class: "installed_extension_list",
    })
    for (const installedExtension of installedExtensions) {
      if (isInstalledExtension(installedExtension.id)) {
        continue
      }
      const element = createInstalledExtension(installedExtension)
      div2.append(element)
    }
    addElement2(div, "h2", { textContent: i("settings.otherExtensions") })
    const div3 = addElement2(div, "div", {
      class: "related_extension_list",
    })
    updateRelatedExtensions(div3)
    return div
  }
  var prefix = "browser_extension_settings_"
  var randomId = String(Math.round(Math.random() * 1e4))
  var settingsContainerId = prefix + "container_" + randomId
  var settingsElementId = prefix + "main_" + randomId
  var getSettingsElement = () => $("#" + settingsElementId)
  var getSettingsStyle = () =>
    style_default
      .replaceAll(/browser_extension_settings_container/gm, settingsContainerId)
      .replaceAll(/browser_extension_settings_main/gm, settingsElementId)
  var storageKey = "settings"
  var settingsOptions
  var settingsTable = {}
  var settings = {}
  async function getSettings() {
    var _a
    return (_a = await getValue(storageKey)) != null ? _a : {}
  }
  async function saveSettingsValue(key, value) {
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
  var closeModal = () => {
    const settingsContainer = getSettingsContainer()
    if (settingsContainer) {
      settingsContainer.style.display = "none"
    }
    removeEventListener(document, "click", onDocumentClick, true)
    removeEventListener(document, "keydown", onDocumentKeyDown, true)
  }
  function hideSettings() {
    closeModal()
  }
  var onDocumentClick = (event) => {
    const target = event.target
    if (
      target == null ? void 0 : target.closest(".".concat(prefix, "container"))
    ) {
      return
    }
    closeModal()
  }
  var onDocumentKeyDown = (event) => {
    if (event.defaultPrevented) {
      return
    }
    if (event.key === "Escape") {
      closeModal()
      event.preventDefault()
    }
  }
  async function updateOptions() {
    if (!getSettingsElement()) {
      return
    }
    for (const key in settingsTable) {
      if (Object.hasOwn(settingsTable, key)) {
        const item = settingsTable[key]
        const type = item.type || "switch"
        switch (type) {
          case "switch": {
            const checkbox = $(
              "#"
                .concat(
                  settingsElementId,
                  ' .option_groups .switch_option[data-key="'
                )
                .concat(key, '"] input')
            )
            if (checkbox) {
              checkbox.checked = getSettingsValue(key)
            }
            break
          }
          case "select": {
            const options = $$(
              "#"
                .concat(
                  settingsElementId,
                  ' .option_groups .select_option[data-key="'
                )
                .concat(key, '"] .bes_select option')
            )
            for (const option of options) {
              option.selected = option.value === String(getSettingsValue(key))
            }
            break
          }
          case "textarea": {
            const textArea = $(
              "#"
                .concat(
                  settingsElementId,
                  ' .option_groups textarea[data-key="'
                )
                .concat(key, '"]')
            )
            if (textArea) {
              textArea.value = getSettingsValue(key)
            }
            break
          }
          default: {
            break
          }
        }
      }
    }
    if (typeof settingsOptions.onViewUpdate === "function") {
      const settingsMain = createSettingsElement()
      settingsOptions.onViewUpdate(settingsMain)
    }
  }
  function getSettingsContainer() {
    const container = $(".".concat(prefix, "container"))
    if (container) {
      const theVersion = parseInt10(container.dataset.besVersion, 0)
      if (theVersion < besVersion) {
        container.id = settingsContainerId
        container.dataset.besVersion = String(besVersion)
      }
      return container
    }
    return addElement2(doc.body, "div", {
      id: settingsContainerId,
      class: "".concat(prefix, "container"),
      "data-bes-version": besVersion,
      style: "display: none;",
    })
  }
  function getSettingsWrapper() {
    const container = getSettingsContainer()
    return (
      $(".".concat(prefix, "wrapper"), container) ||
      addElement2(container, "div", {
        class: "".concat(prefix, "wrapper"),
      })
    )
  }
  function initExtensionList() {
    const wrapper = getSettingsWrapper()
    if (!$(".extension_list_container", wrapper)) {
      const list = createExtensionList([])
      wrapper.append(list)
    }
    addCurrentExtension({
      id: settingsOptions.id,
      title: settingsOptions.title,
      onclick: showSettings,
    })
  }
  function createSettingsElement() {
    let settingsMain = getSettingsElement()
    if (!settingsMain) {
      const wrapper = getSettingsWrapper()
      for (const element of $$(".".concat(prefix, "main"))) {
        element.remove()
      }
      settingsMain = addElement2(wrapper, "div", {
        id: settingsElementId,
        class: "".concat(prefix, "main thin_scrollbar"),
      })
      addElement2(settingsMain, "a", {
        textContent: "Settings",
        class: "navigation_go_previous",
        onclick() {
          activeExtensionList()
        },
      })
      if (settingsOptions.title) {
        addElement2(settingsMain, "h2", { textContent: settingsOptions.title })
      }
      const optionGroups = []
      const getOptionGroup = (index) => {
        if (index > optionGroups.length) {
          for (let i3 = optionGroups.length; i3 < index; i3++) {
            optionGroups.push(
              addElement2(settingsMain, "div", {
                class: "option_groups",
              })
            )
          }
        }
        return optionGroups[index - 1]
      }
      for (const key in settingsTable) {
        if (Object.hasOwn(settingsTable, key)) {
          const item = settingsTable[key]
          const type = item.type || "switch"
          const group = item.group || 1
          const optionGroup = getOptionGroup(group)
          switch (type) {
            case "switch": {
              const switchOption = createSwitchOption(item.icon, item.title, {
                async onchange(event) {
                  const checkbox = event.target
                  if (checkbox) {
                    let result = true
                    if (typeof item.onConfirmChange === "function") {
                      result = item.onConfirmChange(checkbox.checked)
                    }
                    if (result) {
                      await saveSettingsValue(key, checkbox.checked)
                    } else {
                      checkbox.checked = !checkbox.checked
                    }
                  }
                },
              })
              switchOption.dataset.key = key
              addElement2(optionGroup, switchOption)
              break
            }
            case "textarea": {
              let timeoutId
              const div = addElement2(optionGroup, "div", {
                class: "bes_textarea",
              })
              addElement2(div, "textarea", {
                "data-key": key,
                placeholder: item.placeholder || "",
                onkeyup(event) {
                  const textArea = event.target
                  if (timeoutId) {
                    clearTimeout(timeoutId)
                    timeoutId = void 0
                  }
                  timeoutId = setTimeout(async () => {
                    if (textArea) {
                      await saveSettingsValue(key, textArea.value.trim())
                    }
                  }, 100)
                },
              })
              break
            }
            case "action": {
              addElement2(optionGroup, "a", {
                class: "action",
                textContent: item.title,
                onclick: item.onclick,
              })
              break
            }
            case "externalLink": {
              const div4 = addElement2(optionGroup, "div", {
                class: "bes_external_link",
              })
              addElement2(div4, "a", {
                textContent: item.title,
                href: item.url,
                target: "_blank",
              })
              break
            }
            case "select": {
              const div = addElement2(optionGroup, "div", {
                class: "select_option bes_option",
                "data-key": key,
              })
              if (item.icon) {
                addElement2(div, "img", { src: item.icon, class: "bes_icon" })
              }
              addElement2(div, "span", {
                textContent: item.title,
                class: "bes_title",
              })
              const select = addElement2(div, "select", {
                class: "bes_select",
                async onchange() {
                  await saveSettingsValue(key, select.value)
                },
              })
              for (const option of Object.entries(item.options)) {
                addElement2(select, "option", {
                  textContent: option[0],
                  value: option[1],
                })
              }
              break
            }
            case "tip": {
              const tip = addElement2(optionGroup, "div", {
                class: "bes_tip",
              })
              addElement2(tip, "a", {
                class: "bes_tip_anchor",
                textContent: item.title,
              })
              const tipContent = addElement2(tip, "div", {
                class: "bes_tip_content",
                innerHTML: createHTML(item.tipContent),
              })
              break
            }
          }
        }
      }
      if (settingsOptions.footer) {
        const footer = addElement2(settingsMain, "footer")
        footer.innerHTML = createHTML(
          typeof settingsOptions.footer === "string"
            ? settingsOptions.footer
            : '<p>Made with \u2764\uFE0F by\n      <a href="https://www.pipecraft.net/" target="_blank">\n        Pipecraft\n      </a></p>'
        )
      }
    }
    return settingsMain
  }
  function addSideMenu() {
    if (!getSettingsValue("displaySettingsButtonInSideMenu")) {
      return
    }
    const menu =
      $("#browser_extension_side_menu") ||
      addElement2(doc.body, "div", {
        id: "browser_extension_side_menu",
        "data-bes-version": besVersion,
      })
    const button = $("button[data-bes-version]", menu)
    if (button) {
      const theVersion = parseInt10(button.dataset.besVersion, 0)
      if (theVersion >= besVersion) {
        return
      }
      button.remove()
    }
    addElement2(menu, "button", {
      type: "button",
      "data-bes-version": besVersion,
      title: i("settings.menu.settings"),
      onclick() {
        setTimeout(showSettings, 1)
      },
      innerHTML: settingButton,
    })
  }
  function addCommonSettings(settingsTable3) {
    let maxGroup = 0
    for (const key in settingsTable3) {
      if (Object.hasOwn(settingsTable3, key)) {
        const item = settingsTable3[key]
        const group = item.group || 1
        if (group > maxGroup) {
          maxGroup = group
        }
      }
    }
    settingsTable3.displaySettingsButtonInSideMenu = {
      title: i("settings.displaySettingsButtonInSideMenu"),
      defaultValue: !(
        typeof GM === "object" && typeof GM.registerMenuCommand === "function"
      ),
      group: maxGroup + 1,
    }
  }
  function handleShowSettingsUrl() {
    if (location.hash === "#bes-show-settings") {
      setTimeout(showSettings, 100)
    }
  }
  async function showSettings() {
    const settingsContainer = getSettingsContainer()
    const settingsMain = createSettingsElement()
    await updateOptions()
    settingsContainer.style.display = "block"
    addEventListener(document, "click", onDocumentClick, true)
    addEventListener(document, "keydown", onDocumentKeyDown, true)
    activeExtension(settingsOptions.id)
    deactiveExtensionList()
  }
  var initSettings = async (options) => {
    settingsOptions = options
    settingsTable = options.settingsTable || {}
    addCommonSettings(settingsTable)
    addValueChangeListener(storageKey, async () => {
      settings = await getSettings()
      await updateOptions()
      addSideMenu()
      if (typeof options.onValueChange === "function") {
        options.onValueChange()
      }
    })
    settings = await getSettings()
    runWhenHeadExists(() => {
      addStyle(getSettingsStyle())
    })
    runWhenDomReady(() => {
      initExtensionList()
      addSideMenu()
    })
    registerMenuCommand(i("settings.menu.settings"), showSettings, "o")
    handleShowSettingsUrl()
  }
  var content_default =
    ".lh_selected_element{border:solid 1px red;cursor:not-allowed}a[data-lh-erased-href],a[data-lh-erased-href]:hover{cursor:default;pointer-events:none;text-decoration:none}"
  var messages3 = {
    "settings.enable": "Enable",
    "settings.enableCurrentSite": "Enable on current site",
    "settings.enableCustomRulesForTheCurrentSite":
      "Enable custom rules for the current site",
    "settings.customRulesPlaceholder":
      "/* Custom rules for internal URLs, matching URLs will be opened in new tabs */",
    "settings.customRulesTipTitle": "Examples",
    "settings.customRulesTipContent":
      "<p>Custom rules for internal URLs, matching URLs will be opened in new tabs</p>\n  <p>\n  - One line per url pattern<br>\n  - All URLs contains '/posts' or '/users/'<br>\n  <pre>/posts/\n/users/</pre>\n\n  - Regex is supported<br>\n  <pre>^/(posts|members)/d+</pre>\n\n  - '*' for all URLs\n  </p>",
    "settings.enableLinkToImgForCurrentSite":
      "Enable converting image links to image tags for the current site",
    "settings.eraseLinks": "Erase Links",
    "settings.restoreLinks": "Restore Links",
    "settings.title": "\u{1F517} Links Helper",
    "settings.information":
      "After changing the settings, reload the page to take effect",
    "settings.report": "Report and Issue...",
  }
  var en_default2 = messages3
  var messages4 = {
    "settings.enable": "\u542F\u7528\u811A\u672C",
    "settings.enableCurrentSite":
      "\u5728\u5F53\u524D\u7F51\u7AD9\u542F\u7528\u811A\u672C",
    "settings.enableCustomRulesForTheCurrentSite":
      "\u5728\u5F53\u524D\u7F51\u7AD9\u542F\u7528\u81EA\u5B9A\u4E49\u89C4\u5219",
    "settings.customRulesPlaceholder":
      "/* \u5185\u90E8\u94FE\u63A5\u7684\u81EA\u5B9A\u4E49\u89C4\u5219\uFF0C\u5339\u914D\u7684\u94FE\u63A5\u4F1A\u5728\u65B0\u7A97\u53E3\u6253\u5F00 */",
    "settings.customRulesTipTitle": "\u793A\u4F8B",
    "settings.customRulesTipContent":
      "<p>\u5185\u90E8\u94FE\u63A5\u7684\u81EA\u5B9A\u4E49\u89C4\u5219\uFF0C\u5339\u914D\u7684\u94FE\u63A5\u4F1A\u5728\u65B0\u7A97\u53E3\u6253\u5F00</p>\n  <p>\n  - \u6BCF\u884C\u4E00\u6761\u89C4\u5219<br>\n  - \u6240\u6709\u5305\u542B '/posts' \u6216 '/users/' \u7684\u94FE\u63A5<br>\n  <pre>/posts/\n/users/</pre>\n\n  - \u652F\u6301\u6B63\u5219\u8868\u8FBE\u5F0F<br>\n  <pre>^/(posts|members)/d+</pre>\n\n  - '*' \u4EE3\u8868\u5339\u914D\u6240\u6709\u94FE\u63A5\n  </p>",
    "settings.enableLinkToImgForCurrentSite":
      "\u5728\u5F53\u524D\u7F51\u7AD9\u542F\u7528\u56FE\u7247\u94FE\u63A5\u81EA\u52A8\u8F6C\u6362\u4E3A\u56FE\u7247\u6807\u7B7E",
    "settings.eraseLinks":
      "\u53BB\u9664\u6307\u5B9A\u533A\u57DF\u7684\u94FE\u63A5",
    "settings.restoreLinks": "\u6062\u590D\u53BB\u9664\u7684\u94FE\u63A5",
    "settings.title": "\u{1F517} \u94FE\u63A5\u52A9\u624B",
    "settings.information":
      "\u66F4\u6539\u8BBE\u7F6E\u540E\uFF0C\u91CD\u65B0\u52A0\u8F7D\u9875\u9762\u5373\u53EF\u751F\u6548",
    "settings.report": "\u53CD\u9988\u95EE\u9898",
  }
  var zh_cn_default2 = messages4
  var i2 = initI18n({
    "en,en-US": en_default2,
    "zh,zh-CN": zh_cn_default2,
  })
  var lastTarget
  var handleMouseOver = (event) => {
    const target = event.target
    if (!target || target === lastTarget) {
      return
    }
    if (lastTarget) {
      removeClass(lastTarget, "lh_selected_element")
    }
    lastTarget = target
    while (lastTarget && !$("a", lastTarget)) {
      lastTarget = lastTarget.parentElement
    }
    if (lastTarget) {
      addClass(lastTarget, "lh_selected_element")
    }
  }
  var handleMouseClick = (event) => {
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()
    if (lastTarget) {
      for (const element of $$("a[href]", lastTarget)) {
        const href = getAttribute(element, "href")
        if (href) {
          setAttribute(element, "data-lh-erased-href", href)
          element.removeAttribute("href")
        }
      }
      removeClass(lastTarget, "lh_selected_element")
    }
    removeEventListener(doc, "mouseover", handleMouseOver, true)
    removeEventListener(doc, "click", handleMouseClick, true)
    return false
  }
  function eraseLinks() {
    addEventListener(doc, "mouseover", handleMouseOver, true)
    addEventListener(doc, "click", handleMouseClick, true)
  }
  function restoreLinks() {
    for (const element of $$("a[data-lh-erased-href]")) {
      const href = getAttribute(element, "data-lh-erased-href")
      setAttribute(element, "href", href)
      delete element.dataset.lhErasedHref
    }
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
    '<img src="'
      .concat(src, '" title="')
      .concat(text || "image", '" alt="')
      .concat(
        text || "image",
        '" role="img" style="max-width: 100% !important; vertical-align: bottom;" loading="lazy" referrerpolicy="no-referrer" rel="noreferrer" data-lh-status="1"/>'
      )
  var bindOnError = () => {
    for (const element of $$('img[data-lh-status="1"]')) {
      setAttribute(element, "data-lh-status", "2")
      addEventListener(element, "error", (event) => {
        const img = event.target
        const anchor = img.parentElement
        img.outerHTML = createHTML(getAttribute(img, "src"))
        if ((anchor == null ? void 0 : anchor.tagName) === "A") {
          setStyle(anchor, "opacity: 50%;")
          setAttribute(anchor, "data-message", "failed to load image")
        }
      })
    }
  }
  var anchorElementToImgElement = (anchor, href, text) => {
    anchor.innerHTML = createHTML(createImgTagString(href, text))
    setAttribute(anchor, "target", "_blank")
    addAttribute(anchor, "rel", "noopener")
    addAttribute(anchor, "rel", "noreferrer")
  }
  var linkToImg = (anchor) => {
    if (
      !anchor ||
      anchor.childElementCount !== 0 ||
      (anchor.childNodes[0] && anchor.childNodes[0].nodeType !== 3) ||
      anchor.closest("td h1,td h2,td h3,td h4,td h5")
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
    "FILE-ATTACHMENT",
    "NOSCRIPT",
    "TITLE",
  ])
  var urlPattern =
    "\\b((?:https?:\\/\\/(?:[\\w-.]+\\.[a-z]{2,15}|localhost|(?:\\d{1,3}\\.){3}\\d{1,3}))(?::\\d+)?(?:\\/[\\w-/%.~+:;!@=&?#]*)?)"
  var linkPattern1 = new RegExp(
    "!\\[([^\\[\\]]*)\\]\\((?:\\s|<br/?>)*".concat(
      urlPattern,
      "(?:\\s|<br/?>)*\\)"
    ),
    "gim"
  )
  var linkPattern2 = new RegExp(
    "\\[([^\\[\\]]*)\\]\\((?:\\s|<br/?>)*".concat(
      urlPattern,
      "(?:\\s|<br/?>)*\\)"
    ),
    "gim"
  )
  var linkPattern3 = new RegExp(urlPattern, "gim")
  var linkPattern4 = new RegExp(
    "\\[img\\](?:\\s|<br/?>)*".concat(urlPattern, "(?:\\s|<br/?>)*\\[/img\\]"),
    "gim"
  )
  var linkPattern5 = new RegExp(
    "\\[url\\](?:\\s|<br/?>)*".concat(urlPattern, "(?:\\s|<br/?>)*\\[/url\\]"),
    "gim"
  )
  var linkPattern6 = new RegExp(
    "\\[url=".concat(urlPattern, "\\]([^\\[\\]]+)\\[/url\\]"),
    "gim"
  )
  var replaceMarkdownImgLinks = (text) => {
    if (text.search(linkPattern1) >= 0) {
      text = text.replaceAll(linkPattern1, (m, p1, p2) => {
        return createImgTagString(convertImgUrl(p2) || p2, p1)
      })
    }
    return text
  }
  var replaceMarkdownLinks = (text) => {
    if (text.search(linkPattern2) >= 0) {
      text = text.replaceAll(linkPattern2, (m, p1, p2) => {
        return '<a href="'
          .concat(p2, '">')
          .concat(p1.replaceAll(/<br>$/gi, ""), "</a>")
      })
    }
    return text
  }
  var replaceTextLinks = (text) => {
    if (text.search(linkPattern3) >= 0) {
      text = text.replaceAll(linkPattern3, (m, p1) => {
        return '<a href="'.concat(p1, '">').concat(p1, "</a>")
      })
    }
    return text
  }
  var replaceBBCodeImgLinks = (text) => {
    if (text.search(linkPattern4) >= 0) {
      text = text.replaceAll(linkPattern4, (m, p1) => {
        return createImgTagString(convertImgUrl(p1) || p1, p1)
      })
    }
    return text
  }
  var replaceBBCodeLinks = (text) => {
    if (text.search(linkPattern5) >= 0) {
      text = text.replaceAll(linkPattern5, (m, p1) => {
        return '<a href="'.concat(p1, '">').concat(p1, "</a>")
      })
    }
    if (text.search(linkPattern6) >= 0) {
      text = text.replaceAll(linkPattern6, (m, p1, p2) => {
        return '<a href="'.concat(p1, '">').concat(p2, "</a>")
      })
    }
    return text
  }
  var textToLink = (textNode, previousText) => {
    var _a, _b
    const textContent = (_a = textNode.textContent) != null ? _a : ""
    const parentNode = textNode.parentNode
    const mergedText = previousText + textContent
    if (
      !parentNode ||
      textNode.nodeName !== "#text" ||
      textContent.trim().length === 0 ||
      mergedText.trim().length < 3
    ) {
      return
    }
    if (textContent.includes("://")) {
      const original = textContent
      let newContent = original
      if (new RegExp("\\[.*]\\(", "ms").test(original)) {
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
        newContent = newContent.replaceAll(
          new RegExp(
            "(<a(?:\\s[^<>]*)?>.*?<\\/a>)|(<img(?:\\s[^<>]*)?\\/?>)|(.+?(?=(?:<a|<img))|.+$)",
            "gims"
          ),
          (m, p1, p2) => (p1 || p2 ? m : replaceTextLinks(m))
        )
      }
      if (newContent !== original) {
        const span = createElement("span")
        span.innerHTML = createHTML(newContent)
        textNode.after(span)
        textNode.remove()
        return true
      }
    }
    const parentTextContent = (_b = parentNode.textContent) != null ? _b : ""
    if (
      new RegExp("\\[.*]\\(", "ms").test(mergedText) &&
      (parentTextContent.search(linkPattern2) >= 0 ||
        $$("img", parentNode).length > 0)
    ) {
      const original = parentNode.innerHTML
      const newContent = original
        .replaceAll(new RegExp("\\[.*]\\([^[\\]()]+?\\)", "gims"), (m) =>
          m
            .replaceAll(
              /<img[^<>]*\ssrc=['"]?(http[^'"]+)['"]?(\s[^<>]*)?>/gim,
              "$1"
            )
            .replaceAll(
              /\((?:\s|<br\/?>)*<a[^<>]*\shref=['"]?(http[^'"]+)['"]?(\s[^<>]*)?>\1<\/a>(?:\s|<br\/?>)*\)/gim,
              "($1)"
            )
        )
        .replaceAll(
          new RegExp("\\[!\\[.*]\\([^()]+\\)]\\([^[\\]()]+?\\)", "gims"),
          (m) =>
            m
              .replaceAll(
                /<img[^<>]*\ssrc=['"]?(http[^'"]+)['"]?(\s[^<>]*)?>/gim,
                "$1"
              )
              .replaceAll(
                /\((?:\s|<br\/?>)*<a[^<>]*\shref=['"]?(http[^'"]+)['"]?(\s[^<>]*)?>\1<\/a>(?:\s|<br\/?>)*\)/gim,
                "($1)"
              )
        )
      if (newContent !== original) {
        let newContent2 = replaceMarkdownImgLinks(newContent)
        newContent2 = replaceMarkdownLinks(newContent2)
        if (newContent2 !== newContent) {
          parentNode.innerHTML = createHTML(newContent2)
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
        after = before.replaceAll(
          /\[(img|url)[^\]]*]([^[\]]+?)\[\/\1]/gim,
          (m, p1) => {
            let tagsRemoved
            let converted
            if (p1 === "img") {
              tagsRemoved = m
                .replaceAll(
                  /<img[^<>]*\ssrc=['"]?(http[^'"]+)['"]?(\s[^<>]*)?>/gim,
                  "$1"
                )
                .replaceAll(
                  /\[img](?:\s|<br\/?>)*<a[^<>]*\shref=['"]?(http[^'"]+)['"]?(\s[^<>]*)?>\1<\/a>(?:\s|<br\/?>)*\[\/img]/gim,
                  "[img]$1[/img]"
                )
              converted = replaceBBCodeImgLinks(tagsRemoved)
            } else {
              tagsRemoved = m
                .replaceAll(
                  /\[url](?:\s|<br\/?>)*<a[^<>]*\shref=['"]?(http[^'"]+)['"]?(\s[^<>]*)?>\1<\/a>(?:\s|<br\/?>)*\[\/url]/gim,
                  "[url]$1[/url]"
                )
                .replaceAll(
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
        parentNode.innerHTML = createHTML(newContent)
        return true
      }
    }
  }
  var fixAnchorTag = (anchorElement) => {
    var _a
    const href = anchorElement.href
    const textContent = (_a = anchorElement.textContent) != null ? _a : ""
    const nextSibling = anchorElement.nextSibling
    if (
      anchorElement.childElementCount === 0 &&
      href.includes(")") &&
      textContent.includes(")")
    ) {
      const index = textContent.indexOf(")")
      const removed = textContent.slice(Math.max(0, index))
      anchorElement.textContent = textContent.slice(0, Math.max(0, index))
      anchorElement.href = anchorElement.href.slice(
        0,
        Math.max(0, href.indexOf(")"))
      )
      if (nextSibling && nextSibling.nodeType === 3) {
        nextSibling.textContent = removed + nextSibling.textContent
      } else {
        anchorElement.after(doc.createTextNode(removed))
      }
    }
  }
  var isCodeViewer = (element) => {
    return (
      hasClass(element, "diff-view") ||
      hasClass(element, "diff") ||
      hasClass(element, "react-code-lines") ||
      hasClass(element, "virtual-blame-wrapper") ||
      $('[role="code"]', element)
    )
  }
  var scanAndConvertChildNodes = (parentNode) => {
    if (
      !parentNode ||
      parentNode.nodeType === 8 ||
      !parentNode.tagName ||
      ignoredTags.has(parentNode.tagName.toUpperCase()) ||
      isCodeViewer(parentNode)
    ) {
      if (parentNode.tagName === "A") {
        fixAnchorTag(parentNode)
      }
      return
    }
    let previousText = ""
    for (const child of parentNode.childNodes) {
      try {
        if (child.nodeName === "#text") {
          if (textToLink(child, previousText)) {
            scanAndConvertChildNodes(parentNode)
            break
          }
          previousText += child.textContent
        } else if (child.nodeName === "BR") {
          previousText += "\n"
        } else {
          previousText = ""
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
      title: i2("settings.enable"),
      defaultValue: true,
    },
    ["enableCurrentSite_".concat(host)]: {
      title: i2("settings.enableCurrentSite"),
      defaultValue: true,
    },
    ["enableCustomRulesForCurrentSite_".concat(host)]: {
      title: i2("settings.enableCustomRulesForTheCurrentSite"),
      defaultValue: false,
    },
    ["customRulesForCurrentSite_".concat(host)]: {
      title: i2("settings.enableCustomRulesForTheCurrentSite"),
      defaultValue: "",
      placeholder: i2("settings.customRulesPlaceholder"),
      type: "textarea",
      group: 2,
    },
    customRulesTip: {
      title: i2("settings.customRulesTipTitle"),
      type: "tip",
      tipContent: i2("settings.customRulesTipContent"),
      group: 2,
    },
    ["enableLinkToImgForCurrentSite_".concat(host)]: {
      title: i2("settings.enableLinkToImgForCurrentSite"),
      defaultValue: Boolean(/v2ex\.com|localhost/.test(host)),
      group: 3,
    },
    eraseLinks: {
      title: i2("settings.eraseLinks"),
      type: "action",
      async onclick() {
        hideSettings()
        eraseLinks()
      },
      group: 4,
    },
    restoreLinks: {
      title: i2("settings.restoreLinks"),
      type: "action",
      async onclick() {
        hideSettings()
        restoreLinks()
      },
      group: 4,
    },
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
    if (getSettingsValue("enableCustomRulesForCurrentSite_".concat(host))) {
      const rules2 = (
        getSettingsValue("customRulesForCurrentSite_".concat(host)) || ""
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
      id: "links-helper",
      title: i2("settings.title"),
      footer: "\n    <p>"
        .concat(
          i2("settings.information"),
          '</p>\n    <p>\n    <a href="https://github.com/utags/links-helper/issues" target="_blank">\n    '
        )
        .concat(
          i2("settings.report"),
          '\n    </a></p>\n    <p>Made with \u2764\uFE0F by\n    <a href="https://www.pipecraft.net/" target="_blank">\n      Pipecraft\n    </a></p>'
        ),
      settingsTable: settingsTable2,
      onViewUpdate(settingsMainView) {
        const group2 = $(".option_groups:nth-of-type(2)", settingsMainView)
        if (group2) {
          group2.style.display = getSettingsValue(
            "enableCustomRulesForCurrentSite_".concat(host)
          )
            ? "block"
            : "none"
        }
      },
    })
    if (
      !getSettingsValue("enable") ||
      !getSettingsValue("enableCurrentSite_".concat(host))
    ) {
      return
    }
    runWhenHeadExists(() => {
      addStyle(content_default)
    })
    addEventListener(
      doc,
      "click",
      (event) => {
        let anchorElement = event.target
        if (!anchorElement) {
          return
        }
        if (anchorElement.closest(".utags_ul")) {
          if (
            hasClass(anchorElement, "utags_captain_tag") ||
            hasClass(anchorElement, "utags_captain_tag2")
          ) {
            event.preventDefault()
          }
          return
        }
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
        if (getSettingsValue("enableLinkToImgForCurrentSite_".concat(host))) {
          try {
            linkToImg(element)
          } catch (error) {
            console.error(error)
          }
        }
      }
    }
    const scanNodes = throttle(() => {
      scanAndConvertChildNodes(doc.body)
      scanAnchors()
      bindOnError()
    }, 500)
    const observer = new MutationObserver((mutationsList) => {
      scanNodes()
    })
    const startObserver = () => {
      observer.observe(doc.body, {
        childList: true,
        subtree: true,
        characterData: true,
      })
    }
    runWhenBodyExists(() => {
      startObserver()
      scanAndConvertChildNodes(doc.body)
    })
    scanAnchors()
  }
  runWhenHeadExists(async () => {
    if (doc.documentElement.dataset.linksHelper === void 0) {
      doc.documentElement.dataset.linksHelper = ""
      await main()
    }
  })
})()

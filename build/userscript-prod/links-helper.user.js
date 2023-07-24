// ==UserScript==
// @name                 🔗 Links Helper
// @name:zh-CN           🔗 链接助手
// @namespace            https://github.com/utags/links-helper
// @homepageURL          https://github.com/utags/links-helper#readme
// @supportURL           https://github.com/utags/links-helper/issues
// @version              0.5.0
// @description          Open external links in a new tab, open internal links matching the specified rules in a new tab, convert text to hyperlinks, convert image links to image tags(<img>), parse Markdown style links and image tags, parse BBCode style links and image tags
// @description:zh-CN    支持所有网站在新标签页中打开第三方网站链接（外链），在新标签页中打开符合指定规则的本站链接，解析文本链接为超链接，微信公众号文本转可点击的超链接，图片链接转图片标签，解析 Markdown 格式链接与图片标签，解析 BBCode 格式链接与图片标签
// @icon                 data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTUnIGhlaWdodD0nMTUnIHZpZXdCb3g9JzAgMCAxNSAxNScgZmlsbD0nbm9uZScgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48cGF0aCBkPSdNMyAyQzIuNDQ3NzIgMiAyIDIuNDQ3NzIgMiAzVjEyQzIgMTIuNTUyMyAyLjQ0NzcyIDEzIDMgMTNIMTJDMTIuNTUyMyAxMyAxMyAxMi41NTIzIDEzIDEyVjguNUMxMyA4LjIyMzg2IDEyLjc3NjEgOCAxMi41IDhDMTIuMjIzOSA4IDEyIDguMjIzODYgMTIgOC41VjEySDNWM0w2LjUgM0M2Ljc3NjE0IDMgNyAyLjc3NjE0IDcgMi41QzcgMi4yMjM4NiA2Ljc3NjE0IDIgNi41IDJIM1pNMTIuODUzNiAyLjE0NjQ1QzEyLjkwMTUgMi4xOTQzOSAxMi45Mzc3IDIuMjQ5NjQgMTIuOTYyMSAyLjMwODYxQzEyLjk4NjEgMi4zNjY2OSAxMi45OTk2IDIuNDMwMyAxMyAyLjQ5N0wxMyAyLjVWMi41MDA0OVY1LjVDMTMgNS43NzYxNCAxMi43NzYxIDYgMTIuNSA2QzEyLjIyMzkgNiAxMiA1Ljc3NjE0IDEyIDUuNVYzLjcwNzExTDYuODUzNTUgOC44NTM1NUM2LjY1ODI5IDkuMDQ4ODIgNi4zNDE3MSA5LjA0ODgyIDYuMTQ2NDUgOC44NTM1NUM1Ljk1MTE4IDguNjU4MjkgNS45NTExOCA4LjM0MTcxIDYuMTQ2NDUgOC4xNDY0NUwxMS4yOTI5IDNIOS41QzkuMjIzODYgMyA5IDIuNzc2MTQgOSAyLjVDOSAyLjIyMzg2IDkuMjIzODYgMiA5LjUgMkgxMi40OTk5SDEyLjVDMTIuNTY3OCAyIDEyLjYzMjQgMi4wMTM0OSAxMi42OTE0IDIuMDM3OTRDMTIuNzUwNCAyLjA2MjM0IDEyLjgwNTYgMi4wOTg1MSAxMi44NTM2IDIuMTQ2NDVaJyBmaWxsPSdjdXJyZW50Q29sb3InIGZpbGwtcnVsZT0nZXZlbm9kZCcgY2xpcC1ydWxlPSdldmVub2RkJz48L3BhdGg+PC9zdmc+
// @author               Pipecraft
// @license              MIT
// @match                https://*/*
// @match                http://*/*
// @run-at               document-start
// @grant                GM.getValue
// @grant                GM.setValue
// @grant                GM_addValueChangeListener
// @grant                GM_removeValueChangeListener
// @grant                GM_addElement
// @grant                GM_addStyle
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
        for (let i = listeners[key].length - 1; i >= 0; i--) {
          if (listeners[key][i] === func) {
            listeners[key].splice(i, 1)
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
  var runWhenBodyExists = (func) => {
    if (!doc.body) {
      bodyFuncArray.push(func)
      startObserveHeadBodyExists()
      return
    }
    func()
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
  var style_default = `#browser_extension_settings_container{--browser-extension-settings-background-color: #f2f2f7;--browser-extension-settings-text-color: #444444;--browser-extension-settings-link-color: #217dfc;--sb-track-color: #00000000;--sb-thumb-color: #33334480;--sb-size: 2px;position:fixed;top:10px;right:30px;max-height:90%;height:600px;overflow:hidden;display:none;z-index:100000;border-radius:5px;-webkit-box-shadow:0px 10px 39px 10px rgba(62,66,66,.22);-moz-box-shadow:0px 10px 39px 10px rgba(62,66,66,.22);box-shadow:0px 10px 39px 10px rgba(62,66,66,.22) !important}#browser_extension_settings_container .browser_extension_settings_wrapper{display:flex;height:100%;overflow:hidden;background-color:var(--browser-extension-settings-background-color)}#browser_extension_settings_container .browser_extension_settings_wrapper h1{font-size:26px;font-weight:800;border:none}#browser_extension_settings_container .browser_extension_settings_wrapper h2{font-size:18px;font-weight:600;border:none}#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container{overflow-x:auto;box-sizing:border-box;padding:10px 15px;background-color:var(--browser-extension-settings-background-color);color:var(--browser-extension-settings-text-color)}#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .installed_extension_list div,#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .related_extension_list div{background-color:#fff;font-size:14px;border-top:1px solid #ccc;padding:6px 15px 6px 15px}#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .installed_extension_list div a,#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .installed_extension_list div a:visited,#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .related_extension_list div a,#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .related_extension_list div a:visited{display:flex;justify-content:space-between;align-items:center;cursor:pointer;text-decoration:none;color:var(--browser-extension-settings-text-color)}#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .installed_extension_list div a:hover,#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .installed_extension_list div a:visited:hover,#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .related_extension_list div a:hover,#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .related_extension_list div a:visited:hover{text-decoration:none;color:var(--browser-extension-settings-text-color)}#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .installed_extension_list div a span,#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .installed_extension_list div a:visited span,#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .related_extension_list div a span,#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .related_extension_list div a:visited span{margin-right:10px;line-height:24px}#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .installed_extension_list div.active,#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .installed_extension_list div:hover,#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .related_extension_list div.active,#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .related_extension_list div:hover{background-color:#e4e4e6}#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .installed_extension_list div.active a,#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .related_extension_list div.active a{cursor:default}#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .installed_extension_list div:first-of-type,#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .related_extension_list div:first-of-type{border-top:none;border-top-right-radius:10px;border-top-left-radius:10px}#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .installed_extension_list div:last-of-type,#browser_extension_settings_container .browser_extension_settings_wrapper .extension_list_container .related_extension_list div:last-of-type{border-bottom-right-radius:10px;border-bottom-left-radius:10px}#browser_extension_settings_container .thin_scrollbar{scrollbar-color:var(--sb-thumb-color) var(--sb-track-color);scrollbar-width:thin}#browser_extension_settings_container .thin_scrollbar::-webkit-scrollbar{width:var(--sb-size)}#browser_extension_settings_container .thin_scrollbar::-webkit-scrollbar-track{background:var(--sb-track-color);border-radius:10px}#browser_extension_settings_container .thin_scrollbar::-webkit-scrollbar-thumb{background:var(--sb-thumb-color);border-radius:10px}#browser_extension_settings_main{min-width:250px;overflow-y:auto;overflow-x:hidden;box-sizing:border-box;padding:10px 15px;background-color:var(--browser-extension-settings-background-color);color:var(--browser-extension-settings-text-color)}#browser_extension_settings_main h2{text-align:center;margin:5px 0 0;font-size:18px;font-weight:600;border:none}#browser_extension_settings_main footer{display:flex;justify-content:center;flex-direction:column;font-size:11px;margin:10px auto 0px;background-color:var(--browser-extension-settings-background-color);color:var(--browser-extension-settings-text-color)}#browser_extension_settings_main footer a{color:var(--browser-extension-settings-link-color) !important;text-decoration:none;padding:0}#browser_extension_settings_main footer p{text-align:center;padding:0;margin:2px;line-height:13px}#browser_extension_settings_main a.navigation_go_previous{color:var(--browser-extension-settings-link-color);cursor:pointer;display:none}#browser_extension_settings_main a.navigation_go_previous::before{content:"< "}#browser_extension_settings_main .option_groups{background-color:#fff;padding:6px 15px 6px 15px;border-radius:10px;display:flex;flex-direction:column;margin:10px 0 0}#browser_extension_settings_main .option_groups .action{font-size:14px;padding:6px 0 6px 0;color:var(--browser-extension-settings-link-color);cursor:pointer}#browser_extension_settings_main .bes_external_link{font-size:14px;padding:6px 0 6px 0}#browser_extension_settings_main .bes_external_link a,#browser_extension_settings_main .bes_external_link a:visited,#browser_extension_settings_main .bes_external_link a:hover{color:var(--browser-extension-settings-link-color);text-decoration:none;cursor:pointer}#browser_extension_settings_main .option_groups textarea{font-size:12px;margin:10px 0 10px 0;height:100px;width:100%;border:1px solid #a9a9a9;border-radius:4px;box-sizing:border-box}#browser_extension_settings_main .switch_option{display:flex;justify-content:space-between;align-items:center;padding:6px 0 6px 0;font-size:14px}#browser_extension_settings_main .option_groups>*{border-top:1px solid #ccc}#browser_extension_settings_main .option_groups>*:first-child{border-top:none}#browser_extension_settings_main .switch_option>span{margin-right:10px}#browser_extension_settings_main .option_groups .bes_tip{position:relative;margin:0;padding:0 15px 0 0;border:none;max-width:none;font-size:14px}#browser_extension_settings_main .option_groups .bes_tip .bes_tip_anchor{cursor:help;text-decoration:underline}#browser_extension_settings_main .option_groups .bes_tip .bes_tip_content{position:absolute;bottom:15px;left:0;background-color:#fff;color:var(--browser-extension-settings-text-color);text-align:left;padding:10px;display:none;border-radius:5px;-webkit-box-shadow:0px 10px 39px 10px rgba(62,66,66,.22);-moz-box-shadow:0px 10px 39px 10px rgba(62,66,66,.22);box-shadow:0px 10px 39px 10px rgba(62,66,66,.22) !important}#browser_extension_settings_main .option_groups .bes_tip .bes_tip_anchor:hover+.bes_tip_content,#browser_extension_settings_main .option_groups .bes_tip .bes_tip_content:hover{display:block}#browser_extension_settings_main .option_groups .bes_tip p,#browser_extension_settings_main .option_groups .bes_tip pre{margin:revert;padding:revert}#browser_extension_settings_main .option_groups .bes_tip pre{font-family:Consolas,panic sans,bitstream vera sans mono,Menlo,microsoft yahei,monospace;font-size:13px;letter-spacing:.015em;line-height:120%;white-space:pre;overflow:auto;background-color:#f5f5f5;word-break:normal;overflow-wrap:normal;padding:.5em;border:none}#browser_extension_settings_main .container{--button-width: 51px;--button-height: 24px;--toggle-diameter: 20px;--color-off: #e9e9eb;--color-on: #34c759;width:var(--button-width);height:var(--button-height);position:relative;padding:0;margin:0;flex:none;user-select:none}#browser_extension_settings_main input[type=checkbox]{opacity:0;width:0;height:0;position:absolute}#browser_extension_settings_main .switch{width:100%;height:100%;display:block;background-color:var(--color-off);border-radius:calc(var(--button-height)/2);border:none;cursor:pointer;transition:all .2s ease-out}#browser_extension_settings_main .switch::before{display:none}#browser_extension_settings_main .slider{width:var(--toggle-diameter);height:var(--toggle-diameter);position:absolute;left:2px;top:calc(50% - var(--toggle-diameter)/2);border-radius:50%;background:#fff;box-shadow:0px 3px 8px rgba(0,0,0,.15),0px 3px 1px rgba(0,0,0,.06);transition:all .2s ease-out;cursor:pointer}#browser_extension_settings_main input[type=checkbox]:checked+.switch{background-color:var(--color-on)}#browser_extension_settings_main input[type=checkbox]:checked+.switch .slider{left:calc(var(--button-width) - var(--toggle-diameter) - 2px)}#browser_extension_side_menu{min-height:100px;width:40px;opacity:0;position:fixed;top:80px;right:0;padding-top:20px;z-index:10000}#browser_extension_side_menu:hover{opacity:1}#browser_extension_side_menu button{cursor:pointer;width:24px;height:24px;border:none;background-color:rgba(0,0,0,0);background-image:url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M12.0002 16C14.2094 16 16.0002 14.2091 16.0002 12C16.0002 9.79086 14.2094 8 12.0002 8C9.79109 8 8.00023 9.79086 8.00023 12C8.00023 14.2091 9.79109 16 12.0002 16ZM12.0002 14C13.1048 14 14.0002 13.1046 14.0002 12C14.0002 10.8954 13.1048 10 12.0002 10C10.8957 10 10.0002 10.8954 10.0002 12C10.0002 13.1046 10.8957 14 12.0002 14Z' fill='black'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M15.1182 1.86489L15.5203 4.81406C15.8475 4.97464 16.1621 5.1569 16.4623 5.35898L19.2185 4.23223C19.6814 4.043 20.2129 4.2248 20.463 4.65787L22.5901 8.34213C22.8401 8.77521 22.7318 9.3264 22.3365 9.63266L19.9821 11.4566C19.9941 11.6362 20.0002 11.8174 20.0002 12C20.0002 12.1826 19.9941 12.3638 19.9821 12.5434L22.3365 14.3673C22.7318 14.6736 22.8401 15.2248 22.5901 15.6579L20.463 19.3421C20.2129 19.7752 19.6814 19.957 19.2185 19.7678L16.4623 18.641C16.1621 18.8431 15.8475 19.0254 15.5203 19.1859L15.1182 22.1351C15.0506 22.6306 14.6274 23 14.1273 23H9.87313C9.37306 23 8.94987 22.6306 8.8823 22.1351L8.48014 19.1859C8.15296 19.0254 7.83835 18.8431 7.53818 18.641L4.78195 19.7678C4.31907 19.957 3.78756 19.7752 3.53752 19.3421L1.41042 15.6579C1.16038 15.2248 1.26869 14.6736 1.66401 14.3673L4.01841 12.5434C4.00636 12.3638 4.00025 12.1826 4.00025 12C4.00025 11.8174 4.00636 11.6362 4.01841 11.4566L1.66401 9.63266C1.26869 9.3264 1.16038 8.77521 1.41041 8.34213L3.53752 4.65787C3.78755 4.2248 4.31906 4.043 4.78195 4.23223L7.53818 5.35898C7.83835 5.1569 8.15296 4.97464 8.48014 4.81406L8.8823 1.86489C8.94987 1.3694 9.37306 1 9.87313 1H14.1273C14.6274 1 15.0506 1.3694 15.1182 1.86489ZM13.6826 6.14004L14.6392 6.60948C14.8842 6.72975 15.1201 6.86639 15.3454 7.01805L16.231 7.61423L19.1674 6.41382L20.4216 8.58619L17.9153 10.5278L17.9866 11.5905C17.9956 11.7255 18.0002 11.8621 18.0002 12C18.0002 12.1379 17.9956 12.2745 17.9866 12.4095L17.9153 13.4722L20.4216 15.4138L19.1674 17.5862L16.231 16.3858L15.3454 16.982C15.1201 17.1336 14.8842 17.2702 14.6392 17.3905L13.6826 17.86L13.2545 21H10.746L10.3178 17.86L9.36131 17.3905C9.11626 17.2702 8.88037 17.1336 8.6551 16.982L7.76954 16.3858L4.83313 17.5862L3.57891 15.4138L6.0852 13.4722L6.01392 12.4095C6.00487 12.2745 6.00024 12.1379 6.00024 12C6.00024 11.8621 6.00487 11.7255 6.01392 11.5905L6.0852 10.5278L3.57891 8.58619L4.83312 6.41382L7.76953 7.61423L8.6551 7.01805C8.88037 6.86639 9.11625 6.72976 9.36131 6.60949L10.3178 6.14004L10.746 3H13.2545L13.6826 6.14004Z' fill='black'/%3E%3C/svg%3E")}#browser_extension_side_menu button:hover{opacity:70%}#browser_extension_side_menu button:active{opacity:100%}@media(max-width: 500px){#browser_extension_settings_container{right:10px}#browser_extension_settings_container .extension_list_container{display:none}#browser_extension_settings_container .extension_list_container.bes_active{display:block}#browser_extension_settings_container .extension_list_container.bes_active+div{display:none}#browser_extension_settings_main a.navigation_go_previous{display:block}}`
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
  var besVersion = 17
  var openButton = `<svg viewBox="0 0 60.2601318359375 84.8134765625" version="1.1" xmlns="http://www.w3.org/2000/svg" class=" glyph-box" style="height: 9.62969px; width: 6.84191px;"><g transform="matrix(1 0 0 1 -6.194965820312518 77.63671875)"><path d="M66.4551-35.2539C66.4551-36.4746 65.9668-37.5977 65.0391-38.4766L26.3672-76.3672C25.4883-77.1973 24.4141-77.6367 23.1445-77.6367C20.6543-77.6367 18.7012-75.7324 18.7012-73.1934C18.7012-71.9727 19.1895-70.8496 19.9707-70.0195L55.5176-35.2539L19.9707-0.488281C19.1895 0.341797 18.7012 1.41602 18.7012 2.68555C18.7012 5.22461 20.6543 7.12891 23.1445 7.12891C24.4141 7.12891 25.4883 6.68945 26.3672 5.81055L65.0391-32.0312C65.9668-32.959 66.4551-34.0332 66.4551-35.2539Z"></path></g></svg>`
  var openInNewTabButton = `<svg viewBox="0 0 72.127685546875 72.2177734375" version="1.1" xmlns="http://www.w3.org/2000/svg" class=" glyph-box" style="height: 8.19958px; width: 8.18935px;"><g transform="matrix(1 0 0 1 -12.451127929687573 71.3388671875)"><path d="M84.5703-17.334L84.5215-66.4551C84.5215-69.2383 82.7148-71.1914 79.7852-71.1914L30.6641-71.1914C27.9297-71.1914 26.0742-69.0918 26.0742-66.748C26.0742-64.4043 28.1738-62.4023 30.4688-62.4023L47.4609-62.4023L71.2891-63.1836L62.207-55.2246L13.8184-6.73828C12.9395-5.85938 12.4512-4.73633 12.4512-3.66211C12.4512-1.31836 14.5508 0.878906 16.9922 0.878906C18.1152 0.878906 19.1895 0.488281 20.0684-0.439453L68.5547-48.877L76.6113-58.0078L75.7324-35.2051L75.7324-17.1387C75.7324-14.8438 77.7344-12.6953 80.127-12.6953C82.4707-12.6953 84.5703-14.6973 84.5703-17.334Z"></path></g></svg>`
  var relatedExtensions = [
    {
      id: "utags",
      title: "\u{1F3F7}\uFE0F UTags - Add usertags to links",
      url: "https://greasyfork.org/scripts/460718",
    },
    {
      id: "links-helper",
      title: "\u{1F517} \u94FE\u63A5\u52A9\u624B",
      description:
        "\u5728\u65B0\u6807\u7B7E\u9875\u4E2D\u6253\u5F00\u7B2C\u4E09\u65B9\u7F51\u7AD9\u94FE\u63A5\uFF0C\u56FE\u7247\u94FE\u63A5\u8F6C\u56FE\u7247\u6807\u7B7E\u7B49",
      url: "https://greasyfork.org/scripts/464541",
    },
    {
      id: "v2ex.rep",
      title:
        "V2EX.REP - \u4E13\u6CE8\u63D0\u5347 V2EX \u4E3B\u9898\u56DE\u590D\u6D4F\u89C8\u4F53\u9A8C",
      url: "https://greasyfork.org/scripts/466589",
    },
    {
      id: "v2ex.min",
      title: "v2ex.min - V2EX \u6781\u7B80\u98CE\u683C",
      url: "https://greasyfork.org/scripts/463552",
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
    const installed = $(`[data-extension-id="${id}"]`, list)
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
    const installed = $(`[data-extension-id="${id}"]`, list)
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
    svg.outerHTML = openButton
    return div
  }
  var updateRelatedExtensions = (container) => {
    container.innerHTML = ""
    for (const relatedExtension of relatedExtensions) {
      if (isInstalledExtension(relatedExtension.id)) {
        continue
      }
      const div4 = addElement2(container, "div", {
        class: "related_extension",
      })
      const a = addElement2(div4, "a", {
        href: relatedExtension.url,
        target: "_blank",
      })
      addElement2(a, "span", {
        textContent: relatedExtension.title,
      })
      const svg = addElement2(a, "svg")
      svg.outerHTML = openInNewTabButton
    }
  }
  function createExtensionList(installedExtensions) {
    const div = createElement("div", {
      class: "extension_list_container thin_scrollbar",
    })
    addElement2(div, "h1", { textContent: "Settings" })
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
    addElement2(div, "h2", { textContent: "Other Extensions" })
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
      .replace(/browser_extension_settings_container/gm, settingsContainerId)
      .replace(/browser_extension_settings_main/gm, settingsElementId)
  var storageKey = "settings"
  var settingsOptions
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
    if (target == null ? void 0 : target.closest(`.${prefix}container`)) {
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
              `#${settingsElementId} .option_groups .switch_option[data-key="${key}"] input`
            )
            if (checkbox) {
              checkbox.checked = getSettingsValue(key)
            }
            break
          }
          case "textarea": {
            const textArea = $(
              `#${settingsElementId} .option_groups textarea[data-key="${key}"]`
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
    const container = $(`.${prefix}container`)
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
      class: `${prefix}container`,
      "data-bes-version": besVersion,
      style: "display: none;",
    })
  }
  function getSettingsWrapper() {
    const container = getSettingsContainer()
    return (
      $(`.${prefix}wrapper`, container) ||
      addElement2(container, "div", {
        class: `${prefix}wrapper`,
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
      for (const element of $$(`.${prefix}main`)) {
        element.remove()
      }
      settingsMain = addElement2(wrapper, "div", {
        id: settingsElementId,
        class: `${prefix}main thin_scrollbar`,
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
          for (let i = optionGroups.length; i < index; i++) {
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
              const switchOption = createSwitchOption(item.title, {
                async onchange(event) {
                  const checkbox = event.target
                  if (checkbox) {
                    await saveSattingsValue(key, checkbox.checked)
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
                      await saveSattingsValue(key, textArea.value.trim())
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
                innerHTML: item.tipContent,
              })
              break
            }
          }
        }
      }
      if (settingsOptions.footer) {
        const footer = addElement2(settingsMain, "footer")
        footer.innerHTML =
          typeof settingsOptions.footer === "string"
            ? settingsOptions.footer
            : `<p>Made with \u2764\uFE0F by
      <a href="https://www.pipecraft.net/" target="_blank">
        Pipecraft
      </a></p>`
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
      title: "\u8BBE\u7F6E",
      onclick() {
        setTimeout(showSettings, 1)
      },
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
      title: "Display Settings Button in Side Menu",
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
    addStyle2(getSettingsStyle())
    runWhenBodyExists(() => {
      initExtensionList()
      addSideMenu()
    })
    handleShowSettingsUrl()
  }
  var content_default =
    ".lh_selected_element{border:solid 1px red;cursor:not-allowed}a[data-lh-erased-href],a[data-lh-erased-href]:hover{cursor:default;pointer-events:none;text-decoration:none}"
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
        return `<a href="${p2}">${p1.replace(/<br>$/gi, "")}</a>`
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
    const parentTextContent = (_b = parentNode.textContent) != null ? _b : ""
    if (
      new RegExp("\\[.*]\\(", "ms").test(mergedText) &&
      (parentTextContent.search(linkPattern2) >= 0 ||
        $$("img", parentNode).length > 0)
    ) {
      const original = parentNode.innerHTML
      const newContent = original
        .replace(new RegExp("\\[.*]\\([^[\\]()]+?\\)", "gims"), (m) =>
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
        .replace(
          new RegExp("\\[!\\[.*]\\([^()]+\\)]\\([^[\\]()]+?\\)", "gims"),
          (m) =>
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
      title: "Enable",
      defaultValue: true,
    },
    [`enableCurrentSite_${host}`]: {
      title: "Enable current site",
      defaultValue: true,
    },
    [`enableCustomRulesForCurrentSite_${host}`]: {
      title: "Enable custom rules for the current site",
      defaultValue: false,
    },
    [`customRulesForCurrentSite_${host}`]: {
      title: "Enable custom rules for the current site",
      defaultValue: "",
      placeholder:
        "/* Custom rules for internal URLs, matching URLs will be opened in new tabs */",
      type: "textarea",
      group: 2,
    },
    customRulesTip: {
      title: "Examples",
      type: "tip",
      tipContent: `<p>Custom rules for internal URLs, matching URLs will be opened in new tabs</p>
    <p>
    - One line per url pattern<br>
    - All URLs contains '/posts' or '/users/'<br>
    <pre>/posts/
/users/</pre>
    - Regex is supported<br>
    <pre>^/(posts|members)/d+</pre>
    - '*' for all URLs
    </p>`,
      group: 2,
    },
    [`enableLinkToImgForCurrentSite_${host}`]: {
      title: "Enable converting image links to image tags for the current site",
      defaultValue: Boolean(/v2ex\.com|localhost/.test(host)),
      group: 3,
    },
    eraseLinks: {
      title: "Erase Links",
      type: "action",
      async onclick() {
        hideSettings()
        eraseLinks()
      },
      group: 4,
    },
    restoreLinks: {
      title: "Restore Links",
      type: "action",
      async onclick() {
        hideSettings()
        restoreLinks()
      },
      group: 4,
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
      id: "links-helper",
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
      onViewUpdate(settingsMainView) {
        const group2 = $(`.option_groups:nth-of-type(2)`, settingsMainView)
        if (group2) {
          group2.style.display = getSettingsValue(
            `enableCustomRulesForCurrentSite_${host}`
          )
            ? "block"
            : "none"
        }
      },
    })
    registerMenuCommands()
    if (
      !getSettingsValue("enable") ||
      !getSettingsValue(`enableCurrentSite_${host}`)
    ) {
      return
    }
    addStyle2(content_default)
    addEventListener(
      doc,
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
        if (getSettingsValue(`enableLinkToImgForCurrentSite_${host}`)) {
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
  main()
})()

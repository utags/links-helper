// ==UserScript==
// @name                 🔗 Links Helper
// @name:zh-CN           🔗 链接助手
// @namespace            https://github.com/utags/links-helper
// @homepage             https://github.com/utags/links-helper#readme
// @supportURL           https://github.com/utags/links-helper/issues
// @version              0.0.1
// @description          Open external links in a new tab, open links matching the specified rules in a new tab
// @description:zh-CN    支持所有网站在新标签页中打开第三方网站链接，在新标签页中打开符合指定规则的链接
// @icon                 data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTUnIGhlaWdodD0nMTUnIHZpZXdCb3g9JzAgMCAxNSAxNScgZmlsbD0nbm9uZScgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48cGF0aCBkPSdNMyAyQzIuNDQ3NzIgMiAyIDIuNDQ3NzIgMiAzVjEyQzIgMTIuNTUyMyAyLjQ0NzcyIDEzIDMgMTNIMTJDMTIuNTUyMyAxMyAxMyAxMi41NTIzIDEzIDEyVjguNUMxMyA4LjIyMzg2IDEyLjc3NjEgOCAxMi41IDhDMTIuMjIzOSA4IDEyIDguMjIzODYgMTIgOC41VjEySDNWM0w2LjUgM0M2Ljc3NjE0IDMgNyAyLjc3NjE0IDcgMi41QzcgMi4yMjM4NiA2Ljc3NjE0IDIgNi41IDJIM1pNMTIuODUzNiAyLjE0NjQ1QzEyLjkwMTUgMi4xOTQzOSAxMi45Mzc3IDIuMjQ5NjQgMTIuOTYyMSAyLjMwODYxQzEyLjk4NjEgMi4zNjY2OSAxMi45OTk2IDIuNDMwMyAxMyAyLjQ5N0wxMyAyLjVWMi41MDA0OVY1LjVDMTMgNS43NzYxNCAxMi43NzYxIDYgMTIuNSA2QzEyLjIyMzkgNiAxMiA1Ljc3NjE0IDEyIDUuNVYzLjcwNzExTDYuODUzNTUgOC44NTM1NUM2LjY1ODI5IDkuMDQ4ODIgNi4zNDE3MSA5LjA0ODgyIDYuMTQ2NDUgOC44NTM1NUM1Ljk1MTE4IDguNjU4MjkgNS45NTExOCA4LjM0MTcxIDYuMTQ2NDUgOC4xNDY0NUwxMS4yOTI5IDNIOS41QzkuMjIzODYgMyA5IDIuNzc2MTQgOSAyLjVDOSAyLjIyMzg2IDkuMjIzODYgMiA5LjUgMkgxMi40OTk5SDEyLjVDMTIuNTY3OCAyIDEyLjYzMjQgMi4wMTM0OSAxMi42OTE0IDIuMDM3OTRDMTIuNzUwNCAyLjA2MjM0IDEyLjgwNTYgMi4wOTg1MSAxMi44NTM2IDIuMTQ2NDVaJyBmaWxsPSdjdXJyZW50Q29sb3InIGZpbGwtcnVsZT0nZXZlbm9kZCcgY2xpcC1ydWxlPSdldmVub2RkJz48L3BhdGg+PC9zdmc+
// @author               Pipecraft
// @license              MIT
// @match                https://*/*
// @match                http://*/*
// @run-at               document-end
// ==/UserScript==
//
;(() => {
  "use strict"
  var doc = document
  var $$ = (element, selectors) =>
    element && typeof element === "object"
      ? [...element.querySelectorAll(selectors)]
      : [...doc.querySelectorAll(element)]
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
  var getAttribute = (element, name) =>
    element ? element.getAttribute(name) : null
  var setAttribute = (element, name, value) =>
    element ? element.setAttribute(name, value) : void 0
  if (typeof Object.hasOwn !== "function") {
    Object.hasOwn = (instance, prop) =>
      Object.prototype.hasOwnProperty.call(instance, prop)
  }
  var origin = location.origin
  var config = {
    run_at: "document_end",
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
  function main() {
    addEventListener(
      document,
      "click",
      (event) => {
        let linkElement = event.target
        while (linkElement && linkElement.tagName !== "A") {
          linkElement = linkElement.parentNode
        }
        if (linkElement) {
          setAttributeAsOpenInNewTab(linkElement)
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

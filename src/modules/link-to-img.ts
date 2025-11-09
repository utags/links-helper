import {
  $$,
  addAttribute,
  addEventListener,
  createHTML,
  getAttribute,
  setAttribute,
  setAttributes,
  setStyle,
} from "browser-extension-utils"

import rules from "../rules/image-url.json"

const cachedRules = {}

const getHostname = (url: string) => (/https?:\/\/([^/]+)/.exec(url) || [])[1]

const processRule = (rule: string, href: string) => {
  let pattern: RegExp
  let replacement: string | undefined

  const cachedRule = cachedRules[rule]
  try {
    if (cachedRule) {
      pattern = cachedRule.pattern
      replacement = cachedRule.replacement
    } else {
      const result = rule.replace(/ #.*/, "").split("->")
      const patternString = result[0].trim()

      pattern = new RegExp(
        patternString.startsWith("http") ? "^" + patternString : patternString,
        "i"
      )
      replacement = result[1]?.trim()
      cachedRules[rule] = { pattern, replacement }
      // console.log(pattern)
    }

    if (pattern.test(href)) {
      return replacement ? href.replace(pattern, replacement) : href
    }
  } catch (error) {
    console.error(error)
  }
}

export const convertImgUrl = (href: string | undefined) => {
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

export const createImgTagString = (src: string, text: string | undefined) =>
  `<img src="${src}" title="${text || "image"}" alt="${
    text || "image"
  }" role="img" style="max-width: 100% !important; vertical-align: bottom;" loading="lazy" referrerpolicy="no-referrer" rel="noreferrer" data-lh-status="1"/>`

export const bindOnError = () => {
  for (const element of $$('img[data-lh-status="1"]')) {
    setAttribute(element, "data-lh-status", "2")
    addEventListener(element, "error", (event) => {
      const img = event.target as HTMLElement
      const anchor = img.parentElement
      img.outerHTML = createHTML(getAttribute(img, "src"))
      if (anchor?.tagName === "A") {
        setStyle(anchor, "opacity: 50%;")
        setAttribute(anchor, "data-message", "failed to load image")
      }
    })
  }
}

const anchorElementToImgElement = (
  anchor: HTMLAnchorElement,
  href: string,
  text: string | undefined
) => {
  anchor.innerHTML = createHTML(createImgTagString(href, text))
  setAttribute(anchor, "target", "_blank")
  addAttribute(anchor, "rel", "noopener")
  addAttribute(anchor, "rel", "noreferrer")
}

export const linkToImg = (anchor: HTMLAnchorElement) => {
  if (
    !anchor ||
    anchor.childElementCount !== 0 ||
    (anchor.childNodes[0] &&
      anchor.childNodes[0].nodeType !== 3) /* TEXT_NODE */ ||
    anchor.closest(
      "td h1,td h2,td h3,td h4,td h5"
    ) /* file directory like github */
  ) {
    return
  }

  const href = anchor.href

  const text = (anchor.textContent as string | undefined) || href
  const newHref = convertImgUrl(href)
  if (newHref) {
    anchorElementToImgElement(anchor, newHref, text)
  } else if (
    /^https:[^?]+\.(?:jpg|jpeg|jpe|bmp|png|gif|webp|ico|svg)/i.test(href)
  ) {
    anchorElementToImgElement(anchor, href, text)
  }
}

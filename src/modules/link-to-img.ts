import {
  addAttribute,
  setAttribute,
  setAttributes,
} from "browser-extension-utils"
import rulesText from "data-text:../rules/image-url.json"

const rules = JSON.parse(rulesText)

const cachedRules = {}
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
      let newHref
      if (replacement) {
        newHref = href.replace(pattern, replacement)
        // console.log("matched", href, "->", newHref)
      } else {
        newHref = href
      }

      return newHref
    }
  } catch (error) {
    console.error(error)
  }
}

const anchorElementToImgElement = (anchor: HTMLAnchorElement, href, text) => {
  anchor.innerHTML = `<img src="${href}" title="${text}" alt="${text}" role="img" style="max-width: 100% !important; vertical-align: bottom;" loading="lazy" referrerpolicy="no-referrer"/>`
  setAttribute(anchor, "target", "_blank")
  addAttribute(anchor, "rel", "noopener")
  addAttribute(anchor, "rel", "noreferrer")
  setAttributes(anchor.childNodes[0] as HTMLElement, {
    onerror(event) {
      const img = event.srcElement
      img.outerHTML =
        text + '<i class="lh_img_load_failed"> (failed to load)</i>'
    },
  })
}

export const linkToImg = (anchor: HTMLAnchorElement) => {
  if (
    !anchor ||
    anchor.childElementCount !== 0 ||
    anchor.childNodes[0].nodeType !== 3 /* TEXT_NODE */
  ) {
    return
  }

  const href = anchor.href
  const hostname = anchor.hostname
  const text = anchor.textContent
  let matched = false
  if (Object.hasOwn(rules, hostname)) {
    for (const rule of rules[hostname]) {
      const newHref = processRule(rule, href)
      if (newHref) {
        anchorElementToImgElement(anchor, newHref, text)
        matched = true
        break
      }
    }
  }

  if (
    !matched &&
    /^https:[^?]+\.(?:jpg|jpeg|jpe|bmp|png|gif|webp|ico|svg)/i.test(href)
  ) {
    anchorElementToImgElement(anchor, href, text)
  }
}

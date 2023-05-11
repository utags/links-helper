import {
  addAttribute,
  setAttribute,
  setAttributes,
} from "browser-extension-utils"
import rulesText from "data-text:../rules/image-url.json"

const rules = JSON.parse(rulesText)

const cachedRules = {}

// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
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
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  `<img src="${src}" title="${text || "image"}" alt="${
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    text || "image"
  }" role="img" style="max-width: 100% !important; vertical-align: bottom;" loading="lazy" referrerpolicy="no-referrer"/>`

const anchorElementToImgElement = (
  anchor: HTMLAnchorElement,
  href: string,
  text: string | undefined
) => {
  anchor.innerHTML = createImgTagString(href, text)
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
    (anchor.childNodes[0] &&
      anchor.childNodes[0].nodeType !== 3) /* TEXT_NODE */
  ) {
    return
  }

  const href = anchor.href
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
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

import { createElement } from "browser-extension-utils"

import { convertImgUrl, createImgTagString } from "./link-to-img"

const ignoredTags = new Set([
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

const urlPattern =
  "\\b((?:https?:\\/\\/(?:[\\w-.]+\\.[a-z]{2,15}|localhost|(?:\\d{1,3}\\.){3}\\d{1,3}))(?::\\d+)?(?:\\/[\\w-/%.~+:!@=&?#]*)?)"

// ![img](url)
const linkPattern1 = new RegExp(
  `!\\[([^\\[\\]]*)\\]\\(\\s*${urlPattern}\\)`,
  "gim"
)
// [text](url)
const linkPattern2 = new RegExp(
  `\\[([^\\[\\]]*)\\]\\(\\s*${urlPattern}\\)`,
  "gim"
)
// url
const linkPattern3 = new RegExp(urlPattern, "gim")

const replaceMarkdownImgLinks = (text: string) => {
  if (text.search(linkPattern1) >= 0) {
    text = text.replace(linkPattern1, (m, p1: string, p2: string) => {
      // console.log(m, p1, p2)
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      return createImgTagString(convertImgUrl(p2) || p2, p1)
    })
  }

  return text
}

const replaceMarkdownLinks = (text: string) => {
  if (text.search(linkPattern2) >= 0) {
    text = text.replace(linkPattern2, (m, p1: string, p2: string) => {
      return `<a href='${p2}'>${p1}</a>`
    })
  }

  return text
}

const replaceTextLinks = (text: string) => {
  if (text.search(linkPattern3) >= 0) {
    text = text.replace(linkPattern3, (m, p1: string) => {
      // console.log(m, p1)
      return `<a href='${p1}'>${p1}</a>`
    })
  }

  return text
}

const textToLink = (textNode: HTMLElement) => {
  const textContent = textNode.textContent
  if (
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

    if (newContent === original) {
      newContent = replaceTextLinks(original)
    }

    if (newContent === original) {
      console.error(newContent)
    } else {
      const span = createElement("span")
      span.innerHTML = newContent
      textNode.after(span)
      textNode.remove()
      return true
    }
  }

  // markdown style + parsed <a> tags (eg: v2ex comment)
  const parentNode = textNode.parentNode as HTMLElement
  if (
    /\[.*]\(/.test(textContent) &&
    parentNode &&
    parentNode.textContent &&
    parentNode.textContent.search(linkPattern2) >= 0
  ) {
    const original = parentNode.innerHTML
    const newContent = original.replace(
      /\(\s*<a[^<>]*\shref=['"](http[^'"]+)['"]\s[^<>]*>\1<\/a>\)/gim,
      "($1)"
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
}

export const scanAndConvertChildNodes = (parentNode: HTMLElement) => {
  if (
    !parentNode ||
    parentNode.nodeType === 8 /* COMMENT_NODE */ ||
    !parentNode.tagName ||
    ignoredTags.has(parentNode.tagName.toUpperCase())
  ) {
    return
  }

  for (const child of parentNode.childNodes) {
    try {
      if (child.nodeName === "#text") {
        if (textToLink(child as HTMLElement)) {
          // children has changed, re-scan parent node
          scanAndConvertChildNodes(parentNode)
          break
        }
      } else {
        scanAndConvertChildNodes(child as HTMLElement)
      }
    } catch (error) {
      console.error(error)
    }
  }
}

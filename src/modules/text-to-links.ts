import {
  $,
  $$,
  createElement,
  createHTML,
  doc,
  hasClass,
} from "browser-extension-utils"

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
  "FILE-ATTACHMENT",
  "NOSCRIPT",
  "TITLE",
])

const urlPattern =
  "\\b((?:https?:\\/\\/(?:[\\w-.]+\\.[a-z]{2,15}|localhost|(?:\\d{1,3}\\.){3}\\d{1,3}))(?::\\d+)?(?:\\/[\\w-/%.~+:;!@=&?#]*)?)"

// ![img](url)
const linkPattern1 = new RegExp(
  `!\\[([^\\[\\]]*)\\]\\((?:\\s|<br/?>)*${urlPattern}(?:\\s|<br/?>)*\\)`,
  "gim"
)
// [text](url)
const linkPattern2 = new RegExp(
  `\\[([^\\[\\]]*)\\]\\((?:\\s|<br/?>)*${urlPattern}(?:\\s|<br/?>)*\\)`,
  "gim"
)
// url
const linkPattern3 = new RegExp(urlPattern, "gim")

// [img]{url}[/img]
const linkPattern4 = new RegExp(
  `\\[img\\](?:\\s|<br/?>)*${urlPattern}(?:\\s|<br/?>)*\\[/img\\]`,
  "gim"
)

// [url]{url}[/url]
const linkPattern5 = new RegExp(
  `\\[url\\](?:\\s|<br/?>)*${urlPattern}(?:\\s|<br/?>)*\\[/url\\]`,
  "gim"
)

// [url={url}]{text}[/url]
const linkPattern6 = new RegExp(
  `\\[url=${urlPattern}\\]([^\\[\\]]+)\\[/url\\]`,
  "gim"
)

const replaceMarkdownImgLinks = (text: string) => {
  if (text.search(linkPattern1) >= 0) {
    text = text.replaceAll(linkPattern1, (m, p1: string, p2: string) => {
      // console.log(m, p1, p2)

      return createImgTagString(convertImgUrl(p2) || p2, p1)
    })
  }

  return text
}

const replaceMarkdownLinks = (text: string) => {
  if (text.search(linkPattern2) >= 0) {
    text = text.replaceAll(linkPattern2, (m, p1: string, p2: string) => {
      return `<a href="${p2}">${p1.replaceAll(/<br>$/gi, "")}</a>`
    })
  }

  return text
}

const replaceTextLinks = (text: string) => {
  if (text.search(linkPattern3) >= 0) {
    text = text.replaceAll(linkPattern3, (m, p1: string) => {
      // console.log(m, p1)
      return `<a href="${p1}">${p1}</a>`
    })
  }

  return text
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const replaceBBCodeImgLinks = (text: string) => {
  if (text.search(linkPattern4) >= 0) {
    text = text.replaceAll(linkPattern4, (m, p1: string) => {
      return createImgTagString(convertImgUrl(p1) || p1, p1)
    })
  }

  return text
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const replaceBBCodeLinks = (text: string) => {
  if (text.search(linkPattern5) >= 0) {
    text = text.replaceAll(linkPattern5, (m, p1: string) => {
      return `<a href="${p1}">${p1}</a>`
    })
  }

  if (text.search(linkPattern6) >= 0) {
    text = text.replaceAll(linkPattern6, (m, p1: string, p2: string) => {
      return `<a href="${p1}">${p2}</a>`
    })
  }

  return text
}

const textToLink = (textNode: HTMLElement, previousText: string) => {
  const textContent = textNode.textContent ?? ""
  const parentNode = textNode.parentNode as HTMLElement
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
    if (/\[.*]\(/ms.test(original)) {
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
      // Don't replace <a ...>...</a> or <img .../>
      newContent = newContent.replaceAll(
        /(<a(?:\s[^<>]*)?>.*?<\/a>)|(<img(?:\s[^<>]*)?\/?>)|(.+?(?=(?:<a|<img))|.+$)/gims,
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

  const parentTextContent = parentNode.textContent ?? ""

  // markdown style + parsed <a> tags (eg: v2ex comment)
  // [](<a href=xxx>xxx</a>) or ![](<a href=xxx>xxx</a>)
  // ![](<img src="xx">) or ![](<a href=xxx><img src="xxx"></a>)
  if (
    /\[.*]\(/ms.test(mergedText) &&
    (parentTextContent.search(linkPattern2) >= 0 ||
      $$("img", parentNode).length > 0)
  ) {
    const original = parentNode.innerHTML
    // console.log("Markdown", textContent, "=========", original)
    const newContent = original
      .replaceAll(/\[.*]\([^[\]()]+?\)/gims, (m) =>
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
      .replaceAll(/\[!\[.*]\([^()]+\)]\([^[\]()]+?\)/gims, (m) =>
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

    // console.log("newContent", newContent)
    if (newContent !== original) {
      let newContent2 = replaceMarkdownImgLinks(newContent)
      newContent2 = replaceMarkdownLinks(newContent2)

      if (newContent2 !== newContent) {
        parentNode.innerHTML = createHTML(newContent2)
        return true
      }
    }
  }

  // BBCode
  if (
    /\[(img|url)]|\[url=/.test(textContent) &&
    parentTextContent.search(/\[(img|url)[^\]]*]([^[\]]*?)\[\/\1]/) >= 0
  ) {
    const original = parentNode.innerHTML
    // console.log("BBCode", textContent, " ========= ", original)
    let before = ""
    let after: string = original
    let count = 0
    while (before !== after && count < 5) {
      count++
      before = after
      after = before.replaceAll(
        // [img]{url}[/img], [url]{url}[/url] or [url={url}]{text}[/url]
        /\[(img|url)[^\]]*]([^[\]]+?)\[\/\1]/gim,
        (m: string, p1: string) => {
          // console.error("m", m)
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
      // console.error("after", count, after)
    }

    const newContent = after

    if (newContent !== original) {
      parentNode.innerHTML = createHTML(newContent)
      return true
    }
  }
}

const fixAnchorTag = (anchorElement: HTMLAnchorElement) => {
  const href = anchorElement.href
  const textContent = anchorElement.textContent ?? ""
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
    if (nextSibling && nextSibling.nodeType === 3 /* TEXT_NODE */) {
      nextSibling.textContent = removed + nextSibling.textContent
    } else {
      anchorElement.after(doc.createTextNode(removed))
    }
  }
}

const isCodeViewer = (element: HTMLElement) => {
  // https://github.com/utags/links-helper/issues/10
  return (
    hasClass(element, "diff-view") ||
    hasClass(element, "diff") ||
    hasClass(element, "react-code-lines") ||
    hasClass(element, "virtual-blame-wrapper") ||
    $('[role="code"]', element)
  )
}

export const scanAndConvertChildNodes = (parentNode: HTMLElement) => {
  if (
    !parentNode ||
    parentNode.nodeType === 8 /* COMMENT_NODE */ ||
    !parentNode.tagName ||
    ignoredTags.has(parentNode.tagName.toUpperCase()) ||
    isCodeViewer(parentNode)
  ) {
    if (parentNode.tagName === "A") {
      fixAnchorTag(parentNode as HTMLAnchorElement)
    }

    return
  }

  let previousText = ""
  for (const child of parentNode.childNodes) {
    try {
      if (child.nodeName === "#text") {
        if (textToLink(child as HTMLElement, previousText)) {
          // children has changed, re-scan parent node
          scanAndConvertChildNodes(parentNode)
          break
        }

        previousText += child.textContent
      } else if (child.nodeName === "BR") {
        previousText += "\n"
      } else {
        previousText = ""
        scanAndConvertChildNodes(child as HTMLElement)
      }
    } catch (error) {
      console.error(error)
    }
  }
}

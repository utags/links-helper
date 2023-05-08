import { createElement } from "browser-extension-utils"

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
  "NOSCRIPT",
  "TITLE",
])

const linkPattern =
  /\b(https?:\/\/([\w-.]+\.[a-z]{2,15}|localhost|(\d{1,3}\.){3}\d{1,3}))(:\d+)?(\/[\w-/%.~+:!@=&?#]*)?/gim

const textToLink = (textNode) => {
  if (
    textNode.nodeName !== "#text" ||
    !textNode.textContent ||
    textNode.textContent.trim().length < 10
  ) {
    return
  }

  const matched = linkPattern.exec(textNode.textContent)
  if (matched && matched[0]) {
    const span = createElement("span")
    span.innerHTML = textNode.textContent.replace(linkPattern, (m) => {
      return `<a href='${m}'>${m}</a>`
    })
    textNode.after(span)
    textNode.remove()
  }
}

export const scanAndConvertChildNodes = (parentNode) => {
  if (
    !parentNode ||
    parentNode.nodeType === 8 /* COMMENT_NODE */ ||
    !parentNode.tagName ||
    ignoredTags.has(parentNode.tagName.toUpperCase())
  ) {
    return
  }

  for (const child of parentNode.childNodes) {
    if (child.nodeName === "#text") {
      textToLink(child)
    } else {
      scanAndConvertChildNodes(child)
    }
  }
}

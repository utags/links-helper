import {
  $$,
  addAttribute,
  addEventListener,
  createHTML,
  getAttribute,
  setAttribute,
  setAttributes,
  setStyle,
} from 'browser-extension-utils'

import rules from '../rules/image-url.json'
import { getAllImages } from './dom-traversal'

const cachedRules = {}

type ImageProxyOptions = {
  enableProxy: boolean
  domains: string[]
  enableWebp: boolean
}

let imageProxyOptions: ImageProxyOptions = {
  enableProxy: false,
  domains: [],
  enableWebp: false,
}

export const setImageProxyOptions = (options: Partial<ImageProxyOptions>) => {
  imageProxyOptions = { ...imageProxyOptions, ...options }
}

const getHostname = (url: string) => (/https?:\/\/([^/]+)/.exec(url) || [])[1]

const shouldProxyUrl = (url: string) => {
  if (
    !imageProxyOptions.enableProxy ||
    imageProxyOptions.domains.length === 0
  ) {
    return false
  }

  const hostname = getHostname(url)
  if (
    !hostname ||
    hostname === 'wsrv.nl' ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1'
  ) {
    return false
  }

  for (let domain of imageProxyOptions.domains) {
    domain = domain.trim()
    if (!domain) {
      continue
    }

    const isExclude = domain.startsWith('!')
    const pattern = isExclude ? domain.slice(1).trim() : domain
    if (!pattern) {
      continue
    }

    if (pattern === '*') {
      return !isExclude
    }

    if (hostname === pattern || hostname.endsWith(`.${pattern}`)) {
      return !isExclude
    }
  }

  return false
}

const toProxyUrlIfNeeded = (url: string) => {
  if (!shouldProxyUrl(url)) {
    return undefined
  }

  const isGif = /\.gif($|\?)/i.test(url)
  const urlEncoded = encodeURIComponent(url)
  const ddgUrl = `https://external-content.duckduckgo.com/iu/?u=${urlEncoded}`
  const qp = `${isGif ? '&n=-1' : ''}${
    imageProxyOptions.enableWebp ? '&output=webp' : ''
  }&default=${urlEncoded}`
  return `https://wsrv.nl/?url=${encodeURIComponent(ddgUrl)}${qp}`
}

const processRule = (rule: string, href: string) => {
  let pattern: RegExp
  let replacement: string | undefined

  const cachedRule = cachedRules[rule]
  try {
    if (cachedRule) {
      pattern = cachedRule.pattern
      replacement = cachedRule.replacement
    } else {
      const result = rule.replace(/ #.*/, '').split('->')
      const patternString = result[0].trim()

      pattern = new RegExp(
        patternString.startsWith('http') ? '^' + patternString : patternString,
        'i'
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
    for (const rule of rules[hostname] as string[]) {
      const newHref = processRule(rule, href)
      if (newHref) {
        return newHref
      }
    }
  }
}

export const createImgTagString = (src: string, text: string | undefined) =>
  `<img src="${src}" title="${text || 'image'}" alt="${
    text || 'image'
  }" role="img" style="max-width: 100% !important; vertical-align: bottom;" loading="lazy" referrerpolicy="no-referrer" rel="noreferrer" data-lh-status="1"/>`

export const bindOnError = () => {
  for (const element of $$('img[data-lh-status="1"]')) {
    setAttribute(element, 'data-lh-status', '2')
    addEventListener(element, 'error', (event) => {
      const img = event.target as HTMLElement
      const anchor = img.parentElement
      const imgSrc = getAttribute(img, 'src')
      if (imgSrc) {
        img.outerHTML = createHTML(imgSrc)
      }

      if (anchor?.tagName === 'A') {
        setStyle(anchor, 'opacity: 50%;')
        setAttribute(anchor, 'data-message', 'failed to load image')
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
  setAttribute(anchor, 'target', '_blank')
  addAttribute(anchor, 'rel', 'noopener')
  addAttribute(anchor, 'rel', 'noreferrer')
}

export const linkToImg = (anchor: HTMLAnchorElement) => {
  if (
    !anchor ||
    anchor.childElementCount !== 0 ||
    (anchor.childNodes[0] &&
      anchor.childNodes[0].nodeType !== 3) /* TEXT_NODE */ ||
    anchor.closest(
      'td h1,td h2,td h3,td h4,td h5'
    ) /* file directory like github */
  ) {
    return
  }

  const href = anchor.href

  const text = (anchor.textContent as string | undefined) || href
  const convertedHref = convertImgUrl(href)

  if (convertedHref) {
    const finalHref = toProxyUrlIfNeeded(convertedHref) || convertedHref
    anchorElementToImgElement(anchor, finalHref, text)
  } else if (
    /^https:[^?]+\.(?:jpg|jpeg|jpe|bmp|png|gif|webp|ico|svg)/i.test(href)
  ) {
    const finalHref = toProxyUrlIfNeeded(href) || href
    anchorElementToImgElement(anchor, finalHref, text)
  }
}

export const proxyExistingImages = (flag: number) => {
  for (const img of getAllImages()) {
    const src = getAttribute(img, 'src')
    if (!src) {
      continue
    }

    if (img.__links_helper_scaned === flag) {
      continue
    }

    const proxied = toProxyUrlIfNeeded(src)
    if (proxied && proxied !== src) {
      img.removeAttribute('src')
      setAttribute(img, 'loading', 'lazy')
      setAttribute(img, 'referrerpolicy', 'no-referrer')
      setAttribute(img, 'src', proxied)
      const parent = img.parentElement
      if (parent && parent.tagName === 'A') {
        const href = getAttribute(parent, 'href')
        if (href && href === src) {
          setAttribute(parent, 'href', proxied)
        }
      }
    }

    img.__links_helper_scaned = flag
  }
}

import {
  $$,
  addAttribute,
  addEventListener,
  createHTML,
  getAttribute,
  removeAttribute,
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
  enableConvertSvgToPng: boolean
}

let imageProxyOptions: ImageProxyOptions = {
  enableProxy: false,
  domains: [],
  enableWebp: false,
  enableConvertSvgToPng: false,
}

const DDG_BLACK_LIST = [
  // Youtube
  'i.ytimg.com',
]

const DEFAULT_BLOCK_DOMAINS = new Set([
  'wsrv.nl',
  'localhost',
  '127.0.0.1',
  'cdnfile.sspai.com',
])

const isDdgBlacklisted = (hostname: string) =>
  DDG_BLACK_LIST.some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
  )

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
  if (!hostname || DEFAULT_BLOCK_DOMAINS.has(hostname)) {
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
  const allowedExtensions = imageProxyOptions.enableConvertSvgToPng
    ? /\.(jpg|jpeg|png|webp|tiff|gif|svg)$/i
    : /\.(jpg|jpeg|png|webp|tiff|gif)$/i

  const urlWithoutQuery = url.split('?')[0]
  const lastSegment = urlWithoutQuery.split('/').pop() ?? ''

  if (lastSegment.includes('.') && !allowedExtensions.test(lastSegment)) {
    return undefined
  }

  if (lastSegment === 'svg' && !imageProxyOptions.enableConvertSvgToPng) {
    return undefined
  }

  if (!shouldProxyUrl(url)) {
    return undefined
  }

  const isGif = lastSegment.endsWith('.gif')
  const isSvg = lastSegment.endsWith('.svg') || lastSegment === 'svg'
  const enableWebp = imageProxyOptions.enableWebp
  const hostname = getHostname(url)
  const urlEncoded = encodeURIComponent(url)

  const buildWsrvProxyUrl = (urlEncoded: string, defaultUrlEncoded: string) => {
    const qp = `${isGif ? '&n=-1' : ''}${
      enableWebp ? '&output=webp' : ''
    }&default=${defaultUrlEncoded}`
    return `https://wsrv.nl/?url=${urlEncoded}${qp}`
  }

  const level1 = buildWsrvProxyUrl(urlEncoded, urlEncoded)
  if (isSvg || isDdgBlacklisted(hostname)) {
    return level1
  }

  const ddgUrl = `https://external-content.duckduckgo.com/iu/?u=${urlEncoded}`

  const level2 = buildWsrvProxyUrl(
    encodeURIComponent(ddgUrl),
    encodeURIComponent(level1)
  )
  return level2
}

const proxySrcset = (srcset: string) => {
  const parts = srcset.split(',')
  const newParts = parts.map((part) => {
    const trimmed = part.trim()
    const match = /^(\S+)(?:\s+(.+))?$/.exec(trimmed)
    if (!match) {
      return part
    }

    const [, url, descriptor] = match
    let absoluteUrl = url
    try {
      absoluteUrl = new URL(url, document.baseURI).href
    } catch {
      return part
    }

    const proxied = toProxyUrlIfNeeded(absoluteUrl)
    if (proxied) {
      return descriptor ? `${proxied} ${descriptor}` : proxied
    }

    return part
  })

  return newParts.join(', ')
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

const isReactJsImg = (elemnt: HTMLElement) =>
  getAttribute(elemnt, 'node') === '[object Object]'
const cloneImgWithParent = (img: HTMLElement) => {
  try {
    const parent = img.parentElement!
    const newParentElm = parent.cloneNode(true) as HTMLElement
    parent.after(newParentElm)
    const newImg = newParentElm.querySelector('img')!
    if (newImg) {
      parent.style.display = 'none'
      // parent.remove()
      return newImg
    }

    newParentElm.remove()
    return undefined
  } catch {
    return undefined
  }
}

export const proxyExistingImages = (flag: number) => {
  for (const img of getAllImages()) {
    const rawSrc = getAttribute(img, 'src')
    if (!rawSrc) {
      continue
    }

    if (img.__links_helper_scaned === flag) {
      continue
    }

    const src = img.src || rawSrc
    const proxied = toProxyUrlIfNeeded(src)
    const orgImg = img
    if (proxied && proxied !== src) {
      const img = isReactJsImg(orgImg)
        ? cloneImgWithParent(orgImg) || orgImg
        : orgImg

      setAttribute(img, 'data-lh-src', rawSrc)
      img.removeAttribute('src')
      setAttribute(img, 'loading', 'lazy')
      setAttribute(img, 'referrerpolicy', 'no-referrer')
      img.addEventListener('error', (e) => {
        const target = e.target as HTMLImageElement
        if (target && target.src === src) {
          e.stopImmediatePropagation()
          e.stopPropagation()
        }
      })
      setAttribute(img, 'src', proxied)
      const parent = img.parentElement
      if (parent && parent.tagName === 'A') {
        const parentAnchor = parent as HTMLAnchorElement
        if (parentAnchor.href === src) {
          const rawHref = getAttribute(parentAnchor, 'href')
          if (rawHref) {
            setAttribute(parentAnchor, 'data-lh-href', rawHref)
          }

          setAttribute(parentAnchor, 'href', proxied)
        }
      }
    }

    const rawSrcset = getAttribute(img, 'srcset')
    if (rawSrcset) {
      const proxiedSrcset = proxySrcset(rawSrcset)
      if (proxiedSrcset && proxiedSrcset !== rawSrcset) {
        setAttribute(img, 'data-lh-srcset', rawSrcset)
        setAttribute(img, 'loading', 'lazy')
        setAttribute(img, 'referrerpolicy', 'no-referrer')
        setAttribute(img, 'srcset', proxiedSrcset)
      }
    }

    img.__links_helper_scaned = flag
  }
}

export const restoreProxiedImages = () => {
  for (const img of getAllImages()) {
    const rawSrc = getAttribute(img, 'data-lh-src')
    if (rawSrc) {
      setAttribute(img, 'src', rawSrc)
      removeAttribute(img, 'data-lh-src')
      removeAttribute(img, 'loading')
      removeAttribute(img, 'referrerpolicy')

      const parent = img.parentElement
      if (parent && parent.tagName === 'A') {
        const parentAnchor = parent as HTMLAnchorElement
        const rawHref = getAttribute(parentAnchor, 'data-lh-href')
        if (rawHref) {
          setAttribute(parentAnchor, 'href', rawHref)
          removeAttribute(parentAnchor, 'data-lh-href')
        }
      }
    }

    const rawSrcset = getAttribute(img, 'data-lh-srcset')
    if (rawSrcset) {
      setAttribute(img, 'srcset', rawSrcset)
      removeAttribute(img, 'data-lh-srcset')
    }

    // Reset scan flag so it can be re-processed if needed (though we likely disabled proxy)
    delete img.__links_helper_scaned
  }
}

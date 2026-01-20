import { describe, expect, it, vi } from 'vitest'

import {
  linkToImg,
  proxyExistingImages,
  restoreProxiedImages,
  setImageProxyOptions,
} from './link-to-img'

const createAnchor = (href: string, text?: string) => {
  const a = document.createElement('a')
  a.href = href
  a.textContent = text ?? href
  return a
}

describe('linkToImg with image proxy', () => {
  it('should not proxy image URLs when proxy is disabled', () => {
    setImageProxyOptions({
      enableProxy: false,
      domains: ['i.imgur.com'],
      enableWebp: false,
    })

    const href = 'https://i.imgur.com/test.jpg'
    const anchor = createAnchor(href)

    linkToImg(anchor)

    const img = anchor.querySelector('img')
    expect(img).not.toBeNull()
    expect(img?.getAttribute('src')).toBe(href)
  })

  it('should proxy image URLs for configured domains', () => {
    setImageProxyOptions({
      enableProxy: true,
      domains: ['i.imgur.com'],
      enableWebp: false,
    })

    const href = 'https://i.imgur.com/test.jpg'
    const anchor = createAnchor(href)

    linkToImg(anchor)

    const img = anchor.querySelector('img')
    expect(img).not.toBeNull()
    const src = img?.getAttribute('src') || ''
    expect(src.startsWith('https://wsrv.nl/?url=')).toBe(true)
    expect(src).not.toBe(href)
    expect(src.includes('&output=webp')).toBe(false)
  })

  it('should add gif-specific parameter when proxying gif images', () => {
    setImageProxyOptions({
      enableProxy: true,
      domains: ['i.imgur.com'],
      enableWebp: false,
    })

    const href = 'https://i.imgur.com/test.gif'
    const anchor = createAnchor(href)

    linkToImg(anchor)

    const img = anchor.querySelector('img')
    expect(img).not.toBeNull()
    const src = img?.getAttribute('src') || ''
    expect(src.includes('&n=-1')).toBe(true)
  })

  it('should append output=webp when WebP option is enabled', () => {
    setImageProxyOptions({
      enableProxy: true,
      domains: ['i.imgur.com'],
      enableWebp: true,
    })

    const href = 'https://i.imgur.com/test.jpg'
    const anchor = createAnchor(href)

    linkToImg(anchor)

    const img = anchor.querySelector('img')
    expect(img).not.toBeNull()
    const src = img?.getAttribute('src') || ''
    expect(src.includes('&output=webp')).toBe(true)
  })

  it('should proxy existing img tags src when domain is configured', () => {
    setImageProxyOptions({
      enableProxy: true,
      domains: ['i.imgur.com'],
      enableWebp: false,
    })

    const img = document.createElement('img')
    img.src = 'https://i.imgur.com/existing.jpg'
    document.body.append(img)

    proxyExistingImages(1)

    const src = img.getAttribute('src') || ''
    expect(src.startsWith('https://wsrv.nl/?url=')).toBe(true)
    expect(src).not.toBe('https://i.imgur.com/existing.jpg')
  })

  it('should not change existing img tags when proxy is disabled', () => {
    setImageProxyOptions({
      enableProxy: false,
      domains: ['i.imgur.com'],
      enableWebp: false,
    })

    const img = document.createElement('img')
    img.src = 'https://i.imgur.com/existing2.jpg'
    document.body.append(img)

    proxyExistingImages(1)

    const src = img.getAttribute('src') || ''
    expect(src).toBe('https://i.imgur.com/existing2.jpg')
  })

  it('should proxy all domains when * is configured', () => {
    setImageProxyOptions({
      enableProxy: true,
      domains: ['*'],
      enableWebp: false,
    })

    const href = 'https://example.com/image.jpg'
    const anchor = createAnchor(href)

    linkToImg(anchor)

    const img = anchor.querySelector('img')
    const src = img?.getAttribute('src') || ''
    expect(src.startsWith('https://wsrv.nl/?url=')).toBe(true)
    expect(src).not.toBe(href)
  })

  it('should exclude specific domain when !domain is before *', () => {
    setImageProxyOptions({
      enableProxy: true,
      domains: ['!abc.com', '*'],
      enableWebp: false,
    })

    const img1 = document.createElement('img')
    img1.src = 'https://abc.com/img1.jpg'
    document.body.append(img1)

    const img2 = document.createElement('img')
    img2.src = 'https://foo.com/img2.jpg'
    document.body.append(img2)

    proxyExistingImages(2)

    const src1 = img1.getAttribute('src') || ''
    const src2 = img2.getAttribute('src') || ''

    expect(src1).toBe('https://abc.com/img1.jpg')
    expect(src2.startsWith('https://wsrv.nl/?url=')).toBe(true)
  })

  it('should also update parent anchor href when it equals img src', () => {
    setImageProxyOptions({
      enableProxy: true,
      domains: ['i.imgur.com'],
      enableWebp: false,
    })

    const href = 'https://i.imgur.com/nested.jpg'
    const anchor = document.createElement('a')
    anchor.href = href

    const img = document.createElement('img')
    img.src = href
    anchor.append(img)

    document.body.append(anchor)

    proxyExistingImages(3)

    const imgSrc = img.getAttribute('src') || ''
    const anchorHref = anchor.getAttribute('href') || ''

    expect(imgSrc.startsWith('https://wsrv.nl/?url=')).toBe(true)
    expect(anchorHref).toBe(imgSrc)
  })

  it('should remove original src attribute before setting proxy url', () => {
    setImageProxyOptions({
      enableProxy: true,
      domains: ['i.imgur.com'],
      enableWebp: false,
    })

    const img = document.createElement('img')
    img.src = 'https://i.imgur.com/cancel-test.jpg'
    document.body.append(img)

    const spy = vi.spyOn(img, 'removeAttribute')

    proxyExistingImages(4)

    expect(spy).toHaveBeenCalledWith('src')
    expect(img.getAttribute('src')).toContain('wsrv.nl')
  })

  it('should save original src and href to data-lh-* attributes', () => {
    setImageProxyOptions({
      enableProxy: true,
      domains: ['i.imgur.com'],
      enableWebp: false,
    })

    const href = 'https://i.imgur.com/data-attr.jpg'
    const anchor = document.createElement('a')
    anchor.href = href

    const img = document.createElement('img')
    img.src = href
    anchor.append(img)

    document.body.append(anchor)

    proxyExistingImages(5)

    const imgSrc = img.getAttribute('src') || ''
    const anchorHref = anchor.getAttribute('href') || ''
    const dataLhSrc = img.dataset.lhSrc || ''
    const dataLhHref = anchor.dataset.lhHref || ''

    expect(imgSrc.startsWith('https://wsrv.nl/?url=')).toBe(true)
    expect(anchorHref).toBe(imgSrc)
    expect(dataLhSrc).toBe(href)
    expect(dataLhHref).toBe(href)
  })

  it('should proxy relative image URLs by resolving them to absolute URLs', () => {
    // Set up base tag to resolve relative paths to a non-localhost domain
    const base = document.createElement('base')
    base.href = 'https://example.com/'
    document.head.append(base)

    setImageProxyOptions({
      enableProxy: true,
      domains: ['example.com'],
      enableWebp: false,
    })

    const relativePath = 'relative.jpg'
    const absolutePath = 'https://example.com/relative.jpg'

    const anchor = document.createElement('a')
    anchor.href = relativePath // Should resolve to https://example.com/relative.jpg

    const img = document.createElement('img')
    img.src = relativePath // Should resolve to https://example.com/relative.jpg
    anchor.append(img)

    document.body.append(anchor)

    proxyExistingImages(6)

    const imgSrc = img.getAttribute('src') || ''
    const anchorHref = anchor.getAttribute('href') || ''
    const dataLhSrc = img.dataset.lhSrc || ''
    const dataLhHref = anchor.dataset.lhHref || ''

    // Cleanup
    base.remove()

    expect(imgSrc.startsWith('https://wsrv.nl/?url=')).toBe(true)
    // Because of double proxying (wsrv -> ddg -> original), the original URL is double encoded
    expect(imgSrc).toContain(
      encodeURIComponent(encodeURIComponent(absolutePath))
    )
    expect(anchorHref).toBe(imgSrc)
    expect(dataLhSrc).toBe(relativePath)
    // Note: anchor.href (property) is absolute, but getAttribute('href') is relative
    expect(dataLhHref).toBe(relativePath)
  })

  it('should not use DuckDuckGo proxy for SVG images', () => {
    setImageProxyOptions({
      enableProxy: true,
      domains: ['*'],
      enableWebp: false,
      enableConvertSvgToPng: true,
    })

    const href = 'https://example.com/image.svg'
    const anchor = createAnchor(href)

    linkToImg(anchor)

    const img = anchor.querySelector('img')
    expect(img).not.toBeNull()
    const src = img?.getAttribute('src') || ''

    // Should use wsrv.nl directly without nested DDG url
    expect(src.startsWith('https://wsrv.nl/?url=')).toBe(true)
    expect(src).not.toContain('duckduckgo.com')
    // Should contain original URL encoded
    expect(src).toContain(encodeURIComponent(href))
  })

  it('should not use DuckDuckGo proxy for blacklisted domains (e.g. i.ytimg.com)', () => {
    setImageProxyOptions({
      enableProxy: true,
      domains: ['*'],
      enableWebp: false,
    })

    const href = 'https://i.ytimg.com/vi/test/hqdefault.jpg'
    const anchor = createAnchor(href)

    linkToImg(anchor)

    const img = anchor.querySelector('img')
    expect(img).not.toBeNull()
    const src = img?.getAttribute('src') || ''

    // Should use wsrv.nl directly without nested DDG url
    expect(src.startsWith('https://wsrv.nl/?url=')).toBe(true)
    expect(src).not.toContain('duckduckgo.com')
    // Should contain original URL encoded
    expect(src).toContain(encodeURIComponent(href))
  })

  it('should use double proxy chain (wsrv -> ddg -> wsrv -> original) for normal images', () => {
    setImageProxyOptions({
      enableProxy: true,
      domains: ['example.com'],
      enableWebp: false,
    })

    const href = 'https://example.com/image.jpg'
    const anchor = createAnchor(href)

    linkToImg(anchor)

    const img = anchor.querySelector('img')
    expect(img).not.toBeNull()
    const src = img?.getAttribute('src') || ''

    // 1. Primary: wsrv.nl
    expect(src.startsWith('https://wsrv.nl/?url=')).toBe(true)

    // 2. Secondary: DuckDuckGo (encoded in url param)
    const urlParam = new URL(src).searchParams.get('url')
    expect(urlParam).toContain('duckduckgo.com')
    expect(urlParam).toContain(encodeURIComponent(href))

    // 3. Fallback: Level 1 (wsrv -> original)
    const defaultParam = new URL(src).searchParams.get('default')
    expect(defaultParam).toContain('wsrv.nl')
    expect(defaultParam).toContain(encodeURIComponent(href))

    // 4. Fallback of Fallback: Original
    // The default param of the Level 1 URL should be the original URL
    const level1Url = decodeURIComponent(defaultParam || '')
    const level1Default = new URL(level1Url).searchParams.get('default')
    // searchParams.get() decodes the value, so we expect the original href, not the encoded one
    expect(level1Default).toBe(href)
  })

  it('should proxy srcset attributes with descriptors', () => {
    setImageProxyOptions({
      enableProxy: true,
      domains: ['example.com'],
      enableWebp: false,
    })

    const img = document.createElement('img')
    const src = 'https://example.com/image.jpg'
    const srcset =
      'https://example.com/image-320w.jpg 320w, https://example.com/image-480w.jpg 480w'
    img.src = src
    img.srcset = srcset
    document.body.append(img)

    proxyExistingImages(7)

    const newSrc = img.getAttribute('src') || ''
    const newSrcset = img.getAttribute('srcset') || ''
    const dataLhSrcset = img.dataset.lhSrcset || ''

    expect(newSrc).toContain('wsrv.nl')
    expect(newSrcset).toContain('wsrv.nl')
    expect(newSrcset).toContain('320w')
    expect(newSrcset).toContain('480w')

    // Verify structure of first part of srcset
    const firstPart = newSrcset.split(',')[0].trim()
    expect(firstPart).toMatch(/^https:\/\/wsrv\.nl\/\?url=.* 320w$/)

    expect(dataLhSrcset).toBe(srcset)
  })

  it('should proxy relative URLs in srcset', () => {
    const base = document.createElement('base')
    base.href = 'https://example.com/'
    document.head.append(base)

    setImageProxyOptions({
      enableProxy: true,
      domains: ['example.com'],
      enableWebp: false,
    })

    const img = document.createElement('img')
    const src = 'image.jpg'
    const srcset = 'image-1x.jpg 1x, image-2x.jpg 2x'
    img.src = src
    img.srcset = srcset
    document.body.append(img)

    proxyExistingImages(8)

    const newSrcset = img.getAttribute('srcset') || ''
    const dataLhSrcset = img.dataset.lhSrcset || ''

    expect(newSrcset).toContain('wsrv.nl')
    expect(newSrcset).toContain('1x')
    expect(newSrcset).toContain('2x')
    expect(newSrcset).toContain(
      encodeURIComponent(encodeURIComponent('https://example.com/image-1x.jpg'))
    )
    expect(dataLhSrcset).toBe(srcset)

    base.remove()
  })

  it('should filter URLs by extension', () => {
    setImageProxyOptions({
      enableProxy: true,
      domains: ['example.com'],
      enableWebp: false,
      enableConvertSvgToPng: false,
    })

    const urls = [
      'https://example.com/image.jpg',
      'https://example.com/image.png',
      'https://example.com/image.webp',
      'https://example.com/image.gif',
      'https://example.com/image.svg', // should skip
      'https://example.com/image.jpeg',
      'https://example.com/image.tiff',
      'https://example.com/image.exe', // should skip
      'https://example.com/image.html', // should skip
      'https://example.com/image', // no extension, should proxy
      'https://example.com/image.jpg?query=1', // should proxy
    ]

    const container = document.createElement('div')
    for (const url of urls) {
      const img = document.createElement('img')
      img.src = url
      container.append(img)
    }

    document.body.append(container)

    proxyExistingImages(9)

    const images = container.querySelectorAll('img')

    // Allowed extensions
    expect(images[0].src).toContain('wsrv.nl') // jpg
    expect(images[1].src).toContain('wsrv.nl') // png
    expect(images[2].src).toContain('wsrv.nl') // webp
    expect(images[3].src).toContain('wsrv.nl') // gif
    expect(images[4].src).toBe('https://example.com/image.svg') // svg (disabled by default in this test setup)
    expect(images[5].src).toContain('wsrv.nl') // jpeg
    expect(images[6].src).toContain('wsrv.nl') // tiff

    // Disallowed extensions
    expect(images[7].src).toBe('https://example.com/image.exe')
    expect(images[8].src).toBe('https://example.com/image.html')

    // No extension
    expect(images[9].src).toContain('wsrv.nl')

    // Query param
    expect(images[10].src).toContain('wsrv.nl')

    container.remove()
  })

  it('should convert SVG to PNG when enabled', () => {
    setImageProxyOptions({
      enableProxy: true,
      domains: ['example.com'],
      enableWebp: false,
      enableConvertSvgToPng: false,
    })

    const container = document.createElement('div')
    const img = document.createElement('img')
    img.src = 'https://example.com/image.svg'
    container.append(img)
    document.body.append(container)

    // 1. Default (disabled) -> Not proxied at all (undefined returned, so src remains same)
    proxyExistingImages(10)
    expect(img.src).toBe('https://example.com/image.svg')

    // 2. Enabled -> Proxied (default output is png)
    img.src = 'https://example.com/image.svg'
    setImageProxyOptions({
      enableConvertSvgToPng: true,
    })
    proxyExistingImages(11)
    expect(img.src).toContain('wsrv.nl')
    expect(img.src).not.toContain('output=png')

    // 3. WebP enabled but ConvertSvgToPng disabled -> Not proxied
    img.src = 'https://example.com/image.svg'
    setImageProxyOptions({
      enableWebp: true,
      enableConvertSvgToPng: false,
    })
    proxyExistingImages(12)
    expect(img.src).toBe('https://example.com/image.svg')

    // 4. Both enabled -> output=webp
    img.src = 'https://example.com/image.svg'
    setImageProxyOptions({
      enableWebp: true,
      enableConvertSvgToPng: true,
    })
    proxyExistingImages(13)
    expect(img.src).not.toContain('output=png')
    expect(img.src).toContain('output=webp')

    container.remove()
  })

  it('should handle URLs ending with /svg path segment', () => {
    setImageProxyOptions({
      enableProxy: true,
      domains: ['example.com'],
      enableWebp: false,
      enableConvertSvgToPng: false,
    })

    const container = document.createElement('div')
    const img = document.createElement('img')
    img.src = 'https://example.com/badge/svg'
    container.append(img)
    document.body.append(container)

    // 1. Default (disabled) -> Not proxied
    proxyExistingImages(14)
    expect(img.src).toBe('https://example.com/badge/svg')

    // 2. Enabled -> Proxied (default output is png)
    img.src = 'https://example.com/badge/svg'
    setImageProxyOptions({
      enableConvertSvgToPng: true,
    })
    proxyExistingImages(15)
    expect(img.src).toContain('wsrv.nl')
    expect(img.src).not.toContain('output=png')

    container.remove()
  })

  it('should restore proxied images to original state', () => {
    setImageProxyOptions({
      enableProxy: true,
      domains: ['i.imgur.com'],
      enableWebp: false,
    })

    const href = 'https://i.imgur.com/restore.jpg'
    const anchor = document.createElement('a')
    anchor.href = href

    const img = document.createElement('img')
    img.src = href
    anchor.append(img)

    document.body.append(anchor)

    // Proxy first
    proxyExistingImages(100)

    const proxiedSrc = img.getAttribute('src') || ''
    expect(proxiedSrc.startsWith('https://wsrv.nl/?url=')).toBe(true)
    expect(img.dataset.lhSrc).toBe(href)

    // Restore
    restoreProxiedImages()

    expect(img.getAttribute('src')).toBe(href)
    expect(img.dataset.lhSrc).toBeUndefined()
    expect(anchor.getAttribute('href')).toBe(href)
    expect(anchor.dataset.lhHref).toBeUndefined()

    // Check loading and referrerpolicy attributes are removed if they were added
    expect(img.hasAttribute('loading')).toBe(false)
    expect(img.hasAttribute('referrerpolicy')).toBe(false)

    anchor.remove()
  })
})

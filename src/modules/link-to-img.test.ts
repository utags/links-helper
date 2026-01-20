import { describe, expect, it, vi } from 'vitest'

import {
  linkToImg,
  proxyExistingImages,
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
    expect(imgSrc).toContain(encodeURIComponent(absolutePath))
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
      encodeURIComponent('https://example.com/image-1x.jpg')
    )
    expect(dataLhSrcset).toBe(srcset)

    base.remove()
  })
})

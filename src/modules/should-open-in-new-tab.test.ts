import { describe, expect, it, vi } from 'vitest'

import { removeLinkTargetBlank } from './link-attributes'
import {
  shouldOpenInNewTab,
  type LinkHelperContext,
} from './should-open-in-new-tab'

vi.mock('./link-attributes', () => ({
  removeLinkTargetBlank: vi.fn(),
}))

describe('shouldOpenInNewTab', () => {
  const defaultContext: LinkHelperContext = {
    currentUrl: 'https://example.com/page',
    origin: 'https://example.com',
    host: 'example.com',
    currentBaseDomain: 'example.com',
    enableTreatSubdomainsSameSite: false,
    enableCustomRules: false,
    customRules: '',
  }

  const createAnchor = (href: string) => {
    const a = document.createElement('a')
    a.href = href
    return a
  }

  it('should return false for invalid URLs', () => {
    expect(
      // eslint-disable-next-line no-script-url
      shouldOpenInNewTab(createAnchor('javascript:void(0)'), defaultContext)
    ).toBe(false)
    // #hash is resolved to full URL in jsdom, so we need to set it carefully or check how browser behaves.
    // In jsdom, a.href returns full URL.
    // element.getAttribute("href") returns the attribute value.
    const hashAnchor = document.createElement('a')
    hashAnchor.setAttribute('href', '#hash')
    expect(shouldOpenInNewTab(hashAnchor, defaultContext)).toBe(false)
  })

  it('should return false for same URL', () => {
    expect(
      shouldOpenInNewTab(
        createAnchor('https://example.com/page'),
        defaultContext
      )
    ).toBe(false)
  })

  it('should return false for same site with different protocol (http vs https)', () => {
    expect(
      shouldOpenInNewTab(
        createAnchor('http://example.com/page'),
        defaultContext
      )
    ).toBe(false)
  })

  it('should return false for same site with www prefix difference', () => {
    // Current is example.com, target is www.example.com
    expect(
      shouldOpenInNewTab(
        createAnchor('https://www.example.com/page'),
        defaultContext
      )
    ).toBe(false)

    // Current is www.example.com, target is example.com
    const wwwContext = {
      ...defaultContext,
      host: 'www.example.com',
      origin: 'https://www.example.com',
    }
    expect(
      shouldOpenInNewTab(createAnchor('https://example.com/page'), wwwContext)
    ).toBe(false)
  })

  it('should return true for external links', () => {
    expect(
      shouldOpenInNewTab(createAnchor('https://google.com'), defaultContext)
    ).toBe(true)
  })

  it('should return true for subdomains if treatSubdomainsSameSite is false', () => {
    expect(
      shouldOpenInNewTab(
        createAnchor('https://sub.example.com'),
        defaultContext
      )
    ).toBe(true)
  })

  it('should return false for subdomains if treatSubdomainsSameSite is true', () => {
    const context = { ...defaultContext, enableTreatSubdomainsSameSite: true }
    expect(
      shouldOpenInNewTab(createAnchor('https://sub.example.com'), context)
    ).toBe(false)
  })

  describe('Custom Rules', () => {
    it('should return true for matched include rule', () => {
      const context = {
        ...defaultContext,
        enableCustomRules: true,
        customRules: '/foo',
      }
      expect(
        shouldOpenInNewTab(createAnchor('https://example.com/foo'), context)
      ).toBe(true)
    })

    it('should return false for matched exclude rule', () => {
      const context = {
        ...defaultContext,
        enableCustomRules: true,
        customRules: '!/foo',
      }
      expect(
        shouldOpenInNewTab(createAnchor('https://example.com/foo'), context)
      ).toBe(false)
    })

    it('should support regex', () => {
      const context = {
        ...defaultContext,
        enableCustomRules: true,
        customRules: String.raw`/foo\d+`,
      }
      expect(
        shouldOpenInNewTab(createAnchor('https://example.com/foo123'), context)
      ).toBe(true)
      expect(
        shouldOpenInNewTab(createAnchor('https://example.com/bar'), context)
      ).toBe(false)
    })

    it('should handle * wildcard', () => {
      const context = {
        ...defaultContext,
        enableCustomRules: true,
        customRules: '*',
      }
      expect(
        shouldOpenInNewTab(createAnchor('https://example.com/any'), context)
      ).toBe(true)
    })

    it('should handle !* wildcard', () => {
      const context = {
        ...defaultContext,
        enableCustomRules: true,
        customRules: '!*',
      }
      expect(
        shouldOpenInNewTab(createAnchor('https://example.com/any'), context)
      ).toBe(false)
    })

    it('should remove target blank and return false if canonical ID matches', () => {
      const context = {
        ...defaultContext,
        enableCustomRules: true,
        customRules: '*',
        currentCanonicalId: '/t/123',
      }
      const anchor = createAnchor('https://example.com/t/123/reply')
      expect(shouldOpenInNewTab(anchor, context)).toBe(false)
      expect(removeLinkTargetBlank).toHaveBeenCalledWith(anchor)
    })
  })
})

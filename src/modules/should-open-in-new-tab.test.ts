import { describe, expect, it, vi } from "vitest"

import {
  shouldOpenInNewTab,
  type LinkHelperContext,
} from "./should-open-in-new-tab"

describe("shouldOpenInNewTab", () => {
  const defaultContext: LinkHelperContext = {
    currentUrl: "https://example.com/page",
    origin: "https://example.com",
    host: "example.com",
    currentBaseDomain: "example.com",
    enableTreatSubdomainsSameSite: false,
    enableCustomRules: false,
    customRules: "",
    removeAttributeAsOpenInNewTab: vi.fn(),
  }

  const createAnchor = (href: string) => {
    const a = document.createElement("a")
    a.href = href
    return a
  }

  it("should return false for invalid URLs", () => {
    expect(
      // eslint-disable-next-line no-script-url
      shouldOpenInNewTab(createAnchor("javascript:void(0)"), defaultContext)
    ).toBe(false)
    // #hash is resolved to full URL in jsdom, so we need to set it carefully or check how browser behaves.
    // In jsdom, a.href returns full URL.
    // element.getAttribute("href") returns the attribute value.
    const hashAnchor = document.createElement("a")
    hashAnchor.setAttribute("href", "#hash")
    expect(shouldOpenInNewTab(hashAnchor, defaultContext)).toBe(false)
  })

  it("should return false for same URL", () => {
    expect(
      shouldOpenInNewTab(
        createAnchor("https://example.com/page"),
        defaultContext
      )
    ).toBe(false)
  })

  it("should return true for external links", () => {
    expect(
      shouldOpenInNewTab(createAnchor("https://google.com"), defaultContext)
    ).toBe(true)
  })

  it("should return true for subdomains if treatSubdomainsSameSite is false", () => {
    expect(
      shouldOpenInNewTab(
        createAnchor("https://sub.example.com"),
        defaultContext
      )
    ).toBe(true)
  })

  it("should return undefined (false-ish) for subdomains if treatSubdomainsSameSite is true", () => {
    const context = { ...defaultContext, enableTreatSubdomainsSameSite: true }
    expect(
      shouldOpenInNewTab(createAnchor("https://sub.example.com"), context)
    ).toBeUndefined()
  })

  describe("Custom Rules", () => {
    it("should return true for matched include rule", () => {
      const context = {
        ...defaultContext,
        enableCustomRules: true,
        customRules: "/foo",
      }
      expect(
        shouldOpenInNewTab(createAnchor("https://example.com/foo"), context)
      ).toBe(true)
    })

    it("should return false for matched exclude rule", () => {
      const context = {
        ...defaultContext,
        enableCustomRules: true,
        customRules: "!/foo",
      }
      expect(
        shouldOpenInNewTab(createAnchor("https://example.com/foo"), context)
      ).toBe(false)
    })

    it("should support regex", () => {
      const context = {
        ...defaultContext,
        enableCustomRules: true,
        customRules: String.raw`/foo\d+`,
      }
      expect(
        shouldOpenInNewTab(createAnchor("https://example.com/foo123"), context)
      ).toBe(true)
      expect(
        shouldOpenInNewTab(createAnchor("https://example.com/bar"), context)
      ).toBeUndefined()
    })

    it("should handle * wildcard", () => {
      const context = {
        ...defaultContext,
        enableCustomRules: true,
        customRules: "*",
      }
      expect(
        shouldOpenInNewTab(createAnchor("https://example.com/any"), context)
      ).toBe(true)
    })

    it("should handle !* wildcard", () => {
      const context = {
        ...defaultContext,
        enableCustomRules: true,
        customRules: "!*",
      }
      expect(
        shouldOpenInNewTab(createAnchor("https://example.com/any"), context)
      ).toBe(false)
    })
  })
})

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { openInBackgroundTab } from "./open-in-background-tab"

describe("openInBackgroundTab", () => {
  // eslint-disable-next-line n/prefer-global/process
  const originalProcessEnv = process.env
  const mockSendMessage = vi.fn()
  const mockGMOpenInTab = vi.fn()
  const mockGMOpenInTabStandalone = vi.fn()
  const mockWindowOpen = vi.fn()
  const mockFocus = vi.fn()

  beforeEach(() => {
    vi.resetModules()
    vi.stubGlobal("chrome", {
      runtime: {
        sendMessage: mockSendMessage,
      },
    })
    vi.stubGlobal("open", mockWindowOpen)
    vi.stubGlobal("focus", mockFocus)

    // Reset process.env
    // eslint-disable-next-line n/prefer-global/process
    process.env = { ...originalProcessEnv }
    // Reset globals
    vi.stubGlobal("GM", undefined)
    vi.stubGlobal("GM_openInTab", undefined)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    // eslint-disable-next-line n/prefer-global/process
    process.env = originalProcessEnv
  })

  it("should use chrome.runtime.sendMessage when PLASMO_TARGET is chrome-mv3", () => {
    // eslint-disable-next-line n/prefer-global/process
    process.env.PLASMO_TARGET = "chrome-mv3"
    openInBackgroundTab("https://example.com")
    expect(mockSendMessage).toHaveBeenCalledWith({
      type: "open_background_tab",
      url: "https://example.com",
    })
  })

  it("should use GM.openInTab when available and PLASMO_TARGET is not extension", () => {
    // eslint-disable-next-line n/prefer-global/process
    process.env.PLASMO_TARGET = "userscript" as any
    vi.stubGlobal("GM", { openInTab: mockGMOpenInTab })
    openInBackgroundTab("https://example.com")
    expect(mockGMOpenInTab).toHaveBeenCalledWith("https://example.com", {
      active: false,
      insert: true,
    })
  })

  it("should use GM_openInTab when GM.openInTab is not available", () => {
    // eslint-disable-next-line n/prefer-global/process
    process.env.PLASMO_TARGET = "userscript" as any
    vi.stubGlobal("GM_openInTab", mockGMOpenInTabStandalone)
    openInBackgroundTab("https://example.com")
    expect(mockGMOpenInTabStandalone).toHaveBeenCalledWith(
      "https://example.com",
      {
        active: false,
        insert: true,
      }
    )
  })

  it("should fallback to window.open when no GM functions are available", () => {
    // eslint-disable-next-line n/prefer-global/process
    process.env.PLASMO_TARGET = "userscript" as any
    openInBackgroundTab("https://example.com")
    expect(mockWindowOpen).toHaveBeenCalledWith("https://example.com", "_blank")
    expect(mockFocus).toHaveBeenCalledOnce()
  })
})

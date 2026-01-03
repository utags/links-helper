import * as utils from "browser-extension-utils"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { openInBackgroundTab } from "../modules/open-in-background-tab"
import { handleLinkClick, type ClickHandlerDeps } from "./click-handler"

vi.mock("../modules/open-in-background-tab", () => ({
  openInBackgroundTab: vi.fn(),
}))

vi.mock("browser-extension-utils", () => ({
  getAttribute: vi.fn(),
  hasClass: vi.fn(),
}))

describe("handleLinkClick", () => {
  const deps: ClickHandlerDeps = {
    enableBackground: false,
    shouldOpenInNewTab: vi.fn(),
    setAttributeAsOpenInNewTab: vi.fn(),
  }

  let event: any
  let target: any

  beforeEach(() => {
    vi.clearAllMocks()
    target = document.createElement("a")
    event = {
      target,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      stopImmediatePropagation: vi.fn(),
    }
    // Mock closest
    target.closest = vi.fn().mockReturnValue(null)
  })

  it("should do nothing if target is null", () => {
    event.target = null
    handleLinkClick(event as unknown as MouseEvent, deps)
    expect(deps.setAttributeAsOpenInNewTab).not.toHaveBeenCalled()
  })

  it("should prevent default for utags captain tags", () => {
    target.closest.mockReturnValue(true) // Just truthy
    vi.mocked(utils.hasClass).mockReturnValue(true)

    handleLinkClick(event as unknown as MouseEvent, deps)
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it("should find anchor element if clicked on child", () => {
    const span = document.createElement("span")
    target.append(span)
    event.target = span
    // Real DOM traversal works in jsdom

    handleLinkClick(event as unknown as MouseEvent, deps)
    expect(deps.setAttributeAsOpenInNewTab).toHaveBeenCalledWith(target)
  })

  it("should call setAttributeAsOpenInNewTab", () => {
    handleLinkClick(event as unknown as MouseEvent, deps)
    expect(deps.setAttributeAsOpenInNewTab).toHaveBeenCalledWith(target)
  })

  it("should not stop propagation if not opening in new tab", () => {
    vi.mocked(utils.getAttribute).mockReturnValue("_self")
    vi.mocked(deps.shouldOpenInNewTab).mockReturnValue(false)

    handleLinkClick(event as unknown as MouseEvent, deps)
    expect(event.stopImmediatePropagation).not.toHaveBeenCalled()
  })

  it("should stop propagation if target is _blank", () => {
    vi.mocked(utils.getAttribute).mockReturnValue("_blank")

    handleLinkClick(event as unknown as MouseEvent, deps)
    expect(event.stopImmediatePropagation).toHaveBeenCalled()
    expect(event.stopPropagation).toHaveBeenCalled()
  })

  it("should open in background if enabled and shouldOpenInNewTab is true", () => {
    const depsWithBg = { ...deps, enableBackground: true }
    vi.mocked(depsWithBg.shouldOpenInNewTab).mockReturnValue(true)
    vi.mocked(utils.getAttribute).mockReturnValue("_self")
    target.href = "https://example.com"

    handleLinkClick(event as unknown as MouseEvent, depsWithBg)

    expect(event.stopImmediatePropagation).toHaveBeenCalled()
    expect(event.preventDefault).toHaveBeenCalled()
    expect(openInBackgroundTab).toHaveBeenCalledWith("https://example.com/")
  })
})

import * as utils from "browser-extension-utils"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { removeLinkTargetBlank, setLinkTargetToBlank } from "./link-attributes"

vi.mock("browser-extension-utils", () => ({
  addAttribute: vi.fn(),
  removeAttribute: vi.fn(),
  setAttribute: vi.fn(),
  getAttribute: vi.fn(),
}))

describe("link-attributes", () => {
  let element: HTMLAnchorElement

  beforeEach(() => {
    vi.clearAllMocks()
    element = document.createElement("a")
  })

  describe("setLinkTargetToBlank", () => {
    it("should set target to _blank and add rel noopener", () => {
      setLinkTargetToBlank(element)
      expect(utils.setAttribute).toHaveBeenCalledWith(
        element,
        "target",
        "_blank"
      )
      expect(utils.addAttribute).toHaveBeenCalledWith(
        element,
        "rel",
        "noopener"
      )
    })
  })

  describe("removeLinkTargetBlank", () => {
    it("should remove target if it is _blank", () => {
      vi.mocked(utils.getAttribute).mockReturnValue("_blank")
      removeLinkTargetBlank(element)
      expect(utils.removeAttribute).toHaveBeenCalledWith(element, "target")
    })

    it("should NOT remove target if it is not _blank", () => {
      vi.mocked(utils.getAttribute).mockReturnValue("_self")
      removeLinkTargetBlank(element)
      expect(utils.removeAttribute).not.toHaveBeenCalledWith(element, "target")
    })

    it("should NOT remove rel attribute", () => {
      vi.mocked(utils.getAttribute).mockReturnValue("_blank")
      removeLinkTargetBlank(element)
      expect(utils.removeAttribute).not.toHaveBeenCalledWith(element, "rel")
    })
  })
})

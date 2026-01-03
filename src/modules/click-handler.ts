import { getAttribute, hasClass } from "browser-extension-utils"

import { openInBackgroundTab } from "../modules/open-in-background-tab"

export type ClickHandlerDeps = {
  enableBackground: boolean
  shouldOpenInNewTab: (el: HTMLAnchorElement) => boolean | undefined
  setAttributeAsOpenInNewTab: (el: HTMLAnchorElement) => void
}

export const handleLinkClick = (
  event: MouseEvent | Event,
  deps: ClickHandlerDeps
) => {
  let anchorElement = event.target as HTMLElement | undefined

  if (!anchorElement) {
    return
  }

  if (anchorElement.closest(".utags_ul")) {
    if (
      hasClass(anchorElement, "utags_captain_tag") ||
      hasClass(anchorElement, "utags_captain_tag2")
    ) {
      event.preventDefault()
    }

    return
  }

  while (anchorElement && anchorElement.tagName !== "A") {
    anchorElement = anchorElement.parentNode as HTMLElement | undefined
  }

  // Handle SPA apps
  if (anchorElement) {
    deps.setAttributeAsOpenInNewTab(anchorElement as HTMLAnchorElement)
    const isNewTab = getAttribute(anchorElement, "target") === "_blank"
    const shouldOpenBackground =
      deps.enableBackground &&
      deps.shouldOpenInNewTab(anchorElement as HTMLAnchorElement)

    if (isNewTab || shouldOpenBackground) {
      event.stopImmediatePropagation()
      event.stopPropagation()

      if (shouldOpenBackground) {
        event.preventDefault()
        openInBackgroundTab((anchorElement as HTMLAnchorElement).href)
      }
    }
  }
}

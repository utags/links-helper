import { getAttribute, hasClass } from "browser-extension-utils"

import { openInBackgroundTab } from "../modules/open-in-background-tab"
import { setLinkTargetToBlank } from "./link-attributes"

export type ClickHandlerDeps = {
  enableBackground: boolean
  shouldOpenInNewTab: (el: HTMLAnchorElement) => boolean | undefined
}

export const handleLinkClick = (
  event: MouseEvent | Event,
  deps: ClickHandlerDeps
) => {
  let anchorElement: HTMLElement | undefined

  if (event.composedPath) {
    const path = event.composedPath()
    for (const target of path) {
      if ((target as HTMLElement).tagName === "A") {
        anchorElement = target as HTMLElement
        break
      }
    }
  }

  if (!anchorElement) {
    anchorElement = event.target as HTMLElement | undefined
    while (anchorElement && anchorElement.tagName !== "A") {
      anchorElement = anchorElement.parentNode as HTMLElement | undefined
    }
  }

  if (anchorElement) {
    const shouldOpen = deps.shouldOpenInNewTab(
      anchorElement as HTMLAnchorElement
    )
    if (shouldOpen) {
      setLinkTargetToBlank(anchorElement as HTMLAnchorElement)
    }

    // The target attribute might be from the original webpage source, not set by setLinkTargetToBlank above.
    const isNewTab =
      shouldOpen || getAttribute(anchorElement, "target") === "_blank"

    if (isNewTab) {
      // Stop the event from bubbling up to other handlers.
      // Some websites (e.g. YouTube) ignore the target attribute and have their own click handlers that intercept clicks.
      // This logic runs before their internal handlers (due to capture phase) to ensure we handle the new tab behavior.
      event.stopImmediatePropagation()
      event.stopPropagation()

      if (deps.enableBackground) {
        event.preventDefault()
        openInBackgroundTab((anchorElement as HTMLAnchorElement).href)
      }
    }
  }
}

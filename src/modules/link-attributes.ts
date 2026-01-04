import {
  addAttribute,
  getAttribute,
  removeAttribute,
  setAttribute,
} from 'browser-extension-utils'

export const setLinkTargetToBlank = (element: HTMLAnchorElement) => {
  setAttribute(element, 'target', '_blank')
  addAttribute(element, 'rel', 'noopener')
}

export const removeLinkTargetBlank = (element: HTMLAnchorElement) => {
  if (getAttribute(element, 'target') === '_blank') {
    removeAttribute(element, 'target')
    // Keep 'rel' to prevent accidental deletion
    // removeAttribute(element, "rel")
  }
}

import {
  $,
  $$,
  addClass,
  addEventListener,
  doc,
  getAttribute,
  removeClass,
  removeEventListener,
  setAttribute,
} from "browser-extension-utils"

let lastTarget: HTMLElement | undefined

const handleMouseOver = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target || target === lastTarget) {
    return
  }

  if (lastTarget) {
    removeClass(lastTarget, "lh_selected_element")
  }

  lastTarget = target
  while (lastTarget && !$("a", lastTarget)) {
    lastTarget = lastTarget.parentElement!
  }

  if (lastTarget) {
    addClass(lastTarget, "lh_selected_element")
  }
}

const handleMouseClick = (event: Event) => {
  event.preventDefault()
  event.stopPropagation()
  event.stopImmediatePropagation()

  if (lastTarget) {
    for (const element of $$("a[href]", lastTarget)) {
      const href = getAttribute(element, "href")
      if (href) {
        setAttribute(element, "data-lh-erased-href", href)
        element.removeAttribute("href")
      }
    }

    removeClass(lastTarget, "lh_selected_element")
  }

  removeEventListener(doc, "mouseover", handleMouseOver, true)
  removeEventListener(doc, "click", handleMouseClick, true)
  return false
}

export function eraseLinks() {
  addEventListener(doc, "mouseover", handleMouseOver, true)
  addEventListener(doc, "click", handleMouseClick, true)
}

export function restoreLinks() {
  for (const element of $$("a[data-lh-erased-href]")) {
    const href = getAttribute(element, "data-lh-erased-href")
    if (href) setAttribute(element, "href", href)
    delete element.dataset.lhErasedHref
  }
}

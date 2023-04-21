import {
  $$,
  addEventListener,
  getAttribute,
  setAttribute,
} from "browser-extension-utils"
import type { PlasmoCSConfig } from "plasmo"

const origin = location.origin

export const config: PlasmoCSConfig = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  run_at: "document_end",
}

const addAttribute = (element: HTMLElement, name: string, value: string) => {
  const orgValue = getAttribute(element, name)
  if (!orgValue) {
    setAttribute(element, name, value)
  } else if (!orgValue.includes(value)) {
    setAttribute(element, name, orgValue + " " + value)
  }
}

const getOrigin = (url: string) => /(^https?:\/\/[^/]+)/.exec(url)?.[1]

const shouldOpenInNewTab = (url: string | undefined) => {
  if (!url || !/^https?:\/\//.test(url)) {
    return false
  }

  // Open external links in a new tab
  if (getOrigin(url) !== origin) {
    return true
  }

  // TODO: check custom rules
}

const setAttributeAsOpenInNewTab = (element: HTMLElement) => {
  const href = element.href as string | undefined
  if (shouldOpenInNewTab(href)) {
    setAttribute(element, "target", "_blank")
    addAttribute(element, "rel", "noopener")
  }
}

function main() {
  addEventListener(
    document,
    "click",
    (event) => {
      let linkElement = event.target as HTMLElement | undefined

      while (linkElement && linkElement.tagName !== "A") {
        linkElement = linkElement.parentNode as HTMLElement | undefined
      }

      if (linkElement) {
        setAttributeAsOpenInNewTab(linkElement)
      }
    },
    true
  )

  for (const element of $$("a")) {
    setAttributeAsOpenInNewTab(element)
  }
}

main()

import {
  $$,
  addAttribute,
  addEventListener,
  doc,
  getAttribute,
  registerMenuCommand,
  setAttribute,
  throttle,
} from "browser-extension-utils"
import type { PlasmoCSConfig } from "plasmo"

import {
  getSettingsValue,
  initSettings,
  showSettings,
} from "./components/settings"
import { linkToImg } from "./modules/link-to-img"
import { scanAndConvertChildNodes } from "./modules/text-to-links"

const origin = location.origin
const host = location.host

export const config: PlasmoCSConfig = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  run_at: "document_start",
}

const settingsTable = {
  enable: {
    title: "Enable",
    defaultValue: true,
  },
  [`enableCurrentSite_${host}`]: {
    title: "Enable current site",
    defaultValue: true,
  },
  [`enableCustomRulesForCurrentSite_${host}`]: {
    title: "Enable custom rules for current site",
    defaultValue: false,
  },
  [`customRulesForCurrentSite_${host}`]: {
    title: "Enable custom rules for current site",
    defaultValue: "",
    type: "textarea",
  },
}

function registerMenuCommands() {
  registerMenuCommand("⚙️ 设置", showSettings, "o")
}

const getOrigin = (url: string) => /(^https?:\/\/[^/]+)/.exec(url)?.[1]
const getWithoutOrigin = (url: string) => url.replace(/(^https?:\/\/[^/]+)/, "")

const shouldOpenInNewTab = (element: HTMLAnchorElement) => {
  const url = element.href as string | undefined
  if (
    !url ||
    !/^https?:\/\//.test(url) ||
    element.getAttribute("href")?.startsWith("#")
  ) {
    return false
  }

  // Open external links in a new tab
  if (element.origin !== origin) {
    return true
  }

  // Open matched internal links in a new tab
  if (getSettingsValue(`enableCustomRulesForCurrentSite_${host}`)) {
    const rules = (
      (getSettingsValue(`customRulesForCurrentSite_${host}`) as string) || ""
    ).split("\n")
    if (rules.includes("*")) {
      return true
    }

    const hrefWithoutOrigin = getWithoutOrigin(url)
    for (let rule of rules) {
      rule = rule.trim()
      if (rule.length === 0) {
        continue
      }

      try {
        const regexp = new RegExp(rule)
        if (regexp.test(hrefWithoutOrigin)) {
          return true
        }
      } catch (error) {
        console.log(error.message)
        if (hrefWithoutOrigin.includes(rule)) {
          return true
        }
      }
    }
  }
}

const setAttributeAsOpenInNewTab = (element: HTMLAnchorElement) => {
  if (shouldOpenInNewTab(element)) {
    setAttribute(element, "target", "_blank")
    addAttribute(element, "rel", "noopener")
  }
}

async function main() {
  await initSettings({
    title: "🔗 Links Helper",
    footer: `
    <p>After change settings, reload the page to take effect</p>
    <p>
    <a href="https://github.com/utags/links-helper/issues" target="_blank">
    Report and Issue...
    </a></p>
    <p>Made with ❤️ by
    <a href="https://www.pipecraft.net/" target="_blank">
      Pipecraft
    </a></p>`,
    settingsTable,
  })
  registerMenuCommands()

  if (
    !getSettingsValue("enable") ||
    !getSettingsValue(`enableCurrentSite_${host}`)
  ) {
    return
  }

  addEventListener(
    document,
    "click",
    (event) => {
      let anchorElement = event.target as HTMLElement | undefined

      while (anchorElement && anchorElement.tagName !== "A") {
        anchorElement = anchorElement.parentNode as HTMLElement | undefined
      }

      // Handle SPA apps
      if (anchorElement) {
        setAttributeAsOpenInNewTab(anchorElement as HTMLAnchorElement)
        if (getAttribute(anchorElement, "target") === "_blank") {
          event.stopImmediatePropagation()
          event.stopPropagation()
        }
      }
    },
    true
  )

  const scanAnchors = () => {
    for (const element of $$("a")) {
      if (element.__links_helper_scaned) {
        continue
      }

      element.__links_helper_scaned = 1
      try {
        setAttributeAsOpenInNewTab(element as HTMLAnchorElement)
      } catch (error) {
        console.error(error)
      }

      try {
        linkToImg(element as HTMLAnchorElement)
      } catch (error) {
        console.error(error)
      }
    }
  }

  const scanNodes = throttle(() => {
    // console.error("mutation - scanAndConvertChildNodes, scanAnchors", Date.now())
    scanAndConvertChildNodes(doc.body)
    scanAnchors()
  }, 500)

  const observer = new MutationObserver(() => {
    // console.error("mutation", Date.now())
    scanNodes()
  })

  const startObserver = () => {
    observer.observe(doc.body, {
      // attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
    })
  }

  if (doc.body) {
    startObserver()
    scanAndConvertChildNodes(doc.body)
  } else {
    const intervalId = setInterval(() => {
      if (doc.body) {
        clearInterval(intervalId)
        startObserver()
        scanAndConvertChildNodes(doc.body)
      }
    }, 100)
  }

  scanAnchors()
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises, unicorn/prefer-top-level-await
main()

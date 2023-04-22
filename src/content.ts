import {
  $$,
  addEventListener,
  getAttribute,
  registerMenuCommand,
  setAttribute,
} from "browser-extension-utils"
import type { PlasmoCSConfig } from "plasmo"

import {
  getSettingsValue,
  initSettings,
  showSettings,
} from "./components/settings"

const origin = location.origin
const host = location.host

export const config: PlasmoCSConfig = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  run_at: "document_end",
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
}

function registerMenuCommands() {
  registerMenuCommand("⚙️ 设置", showSettings, "o")
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
  // console.log(element)
  // console.log(element.getAttribute("href"))
  // console.log(element.href)
  // console.log(element.hostname)
  // console.log(element.origin)
  // console.log(element.pathname)
  const href = element.href as string | undefined
  if (shouldOpenInNewTab(href)) {
    setAttribute(element, "target", "_blank")
    addAttribute(element, "rel", "noopener")
  }
}

async function main() {
  await initSettings({
    title: "🔗 Links Helper",
    footer: `
    <p>Reload the page to take effect</p>
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
    !getSettingsValue(`enableThisSite_${host}`)
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

      if (anchorElement) {
        setAttributeAsOpenInNewTab(anchorElement)
      }
    },
    true
  )

  for (const element of $$("a")) {
    setAttributeAsOpenInNewTab(element)
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises, unicorn/prefer-top-level-await
main()

import {
  getSettingsValue,
  initSettings,
  showSettings,
} from "browser-extension-settings"
import {
  $,
  $$,
  addAttribute,
  addEventListener,
  doc,
  getAttribute,
  registerMenuCommand,
  runWhenBodyExists,
  setAttribute,
  throttle,
} from "browser-extension-utils"
import type { PlasmoCSConfig } from "plasmo"

import { bindOnError, linkToImg } from "./modules/link-to-img"
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
    title: "Enable custom rules for the current site",
    defaultValue: false,
  },
  [`customRulesForCurrentSite_${host}`]: {
    title: "Enable custom rules for the current site",
    defaultValue: "",
    placeholder:
      "/* Custom rules for internal URLs, matching URLs will be opened in new tabs */",
    type: "textarea",
    group: 2,
  },
  customRulesTip: {
    title: "Examples",
    type: "tip",
    tipContent: `<p>Custom rules for internal URLs, matching URLs will be opened in new tabs</p>
    <p>
    - One line per url pattern<br>
    - All URLs contains '/posts' or '/users/'<br>
    <pre>/posts/
/users/</pre>

    - Regex is supported<br>
    <pre>^/(posts|members)/d+</pre>

    - '*' for all URLs
    </p>`,
    group: 2,
  },
  [`enableLinkToImgForCurrentSite_${host}`]: {
    title: "Enable converting image links to image tags for the current site",
    defaultValue: Boolean(/v2ex\.com|localhost/.test(host)),
    group: 3,
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
    id: "links-helper",
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
    onViewUpdate(settingsMainView) {
      const group2 = $(`.option_groups:nth-of-type(2)`, settingsMainView)
      if (group2) {
        group2.style.display = getSettingsValue(
          `enableCustomRulesForCurrentSite_${host}`
        )
          ? "block"
          : "none"
      }
    },
  })
  registerMenuCommands()

  if (
    !getSettingsValue("enable") ||
    !getSettingsValue(`enableCurrentSite_${host}`)
  ) {
    return
  }

  addEventListener(
    doc,
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

      if (getSettingsValue(`enableLinkToImgForCurrentSite_${host}`)) {
        try {
          linkToImg(element as HTMLAnchorElement)
        } catch (error) {
          console.error(error)
        }
      }
    }
  }

  const scanNodes = throttle(() => {
    // console.error(
    //   "mutation - scanAndConvertChildNodes, scanAnchors",
    //   Date.now()
    // )
    scanAndConvertChildNodes(doc.body)
    scanAnchors()
    bindOnError()
  }, 500)

  const observer = new MutationObserver((mutationsList) => {
    // console.error("mutation", Date.now(), mutationsList)
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

  runWhenBodyExists(() => {
    startObserver()
    scanAndConvertChildNodes(doc.body)
  })

  scanAnchors()
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises, unicorn/prefer-top-level-await
main()

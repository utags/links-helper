import {
  getSettingsValue,
  hideSettings,
  initSettings,
} from "browser-extension-settings"
import {
  $,
  $$,
  addAttribute,
  addEventListener,
  addStyle,
  doc,
  getAttribute,
  hasClass,
  runWhenBodyExists,
  runWhenHeadExists,
  setAttribute,
  throttle,
} from "browser-extension-utils"
import styleText from "data-text:./content.scss"
import type { PlasmoCSConfig } from "plasmo"

import { i } from "./messages"
import { eraseLinks, restoreLinks } from "./modules/erase-links"
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
    title: i("settings.enable"),
    defaultValue: true,
  },
  [`enableCurrentSite_${host}`]: {
    title: i("settings.enableCurrentSite"),
    defaultValue: true,
  },
  [`enableCustomRulesForCurrentSite_${host}`]: {
    title: i("settings.enableCustomRulesForTheCurrentSite"),
    defaultValue: false,
  },
  [`customRulesForCurrentSite_${host}`]: {
    title: i("settings.enableCustomRulesForTheCurrentSite"),
    defaultValue: "",
    placeholder: i("settings.customRulesPlaceholder"),
    type: "textarea",
    group: 2,
  },
  customRulesTip: {
    title: i("settings.customRulesTipTitle"),
    type: "tip",
    tipContent: i("settings.customRulesTipContent"),
    group: 2,
  },
  [`enableLinkToImgForCurrentSite_${host}`]: {
    title: i("settings.enableLinkToImgForCurrentSite"),
    defaultValue: Boolean(/v2ex\.com|localhost/.test(host)),
    group: 3,
  },
  eraseLinks: {
    title: i("settings.eraseLinks"),
    type: "action",
    async onclick() {
      hideSettings()
      eraseLinks()
    },
    group: 4,
  },
  restoreLinks: {
    title: i("settings.restoreLinks"),
    type: "action",
    async onclick() {
      hideSettings()
      restoreLinks()
    },
    group: 4,
  },
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
    title: i("settings.title"),
    footer: `
    <p>${i("settings.information")}</p>
    <p>
    <a href="https://github.com/utags/links-helper/issues" target="_blank">
    ${i("settings.report")}
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

  if (
    !getSettingsValue("enable") ||
    !getSettingsValue(`enableCurrentSite_${host}`)
  ) {
    return
  }

  runWhenHeadExists(() => {
    addStyle(styleText)
  })

  addEventListener(
    doc,
    "click",
    (event) => {
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

runWhenHeadExists(async () => {
  if (doc.documentElement.dataset.linksHelper === undefined) {
    doc.documentElement.dataset.linksHelper = ""
    await main()
  }
})

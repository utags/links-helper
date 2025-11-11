import { getPrefferedLocale } from "browser-extension-i18n"
import {
  getSettingsValue,
  hideSettings,
  initSettings,
  showSettings,
  type SettingsTable,
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
  removeAttribute,
  runWhenBodyExists,
  runWhenHeadExists,
  setAttribute,
  throttle,
} from "browser-extension-utils"
import styleText from "data-text:./content.scss"
import type { PlasmoCSConfig } from "plasmo"

import { getAvailableLocales, i, resetI18n } from "./messages"
import { eraseLinks, restoreLinks } from "./modules/erase-links"
import { bindOnError, linkToImg } from "./modules/link-to-img"
import { scanAndConvertChildNodes } from "./modules/text-to-links"
import { extractCanonicalId, getBaseDomain } from "./utils/index"

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions, @typescript-eslint/naming-convention
  interface HTMLElement {
    __links_helper_scaned?: number
  }
}

const origin = location.origin
const host = location.host
const hostname = location.hostname
let currentUrl: string | undefined
let currentCanonicalId: string | undefined
let enableTreatSubdomainsSameSite = false
let enableBackground = false
let enableLinkToImg = false

if (
  // eslint-disable-next-line n/prefer-global/process
  process.env.PLASMO_TARGET === "chrome-mv3" ||
  // eslint-disable-next-line n/prefer-global/process
  process.env.PLASMO_TARGET === "firefox-mv3"
) {
  // Receive popup trigger to show settings in the content context
  const runtime =
    (globalThis as any).chrome?.runtime ?? (globalThis as any).browser?.runtime
  runtime?.onMessage?.addListener((message: any) => {
    if (message?.type === "links-helper:show-settings") {
      showSettings()
    }
  })
}

export const config: PlasmoCSConfig = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  run_at: "document_start",
}

const getSettingsTable = (): SettingsTable => {
  let groupNumber = 1
  return {
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
      group: ++groupNumber,
    },
    customRulesTip: {
      title: i("settings.customRulesTipTitle"),
      type: "tip",
      tipContent: i("settings.customRulesTipContent"),
      group: groupNumber,
    },
    [`enableOpenNewTabInBackgroundForCurrentSite_${host}`]: {
      title: i("settings.enableOpenNewTabInBackgroundForCurrentSite"),
      defaultValue: false,
      group: ++groupNumber,
    },
    [`enableTreatSubdomainsAsSameSiteForCurrentSite_${host}`]: {
      title: i("settings.enableTreatSubdomainsAsSameSiteForCurrentSite"),
      defaultValue: false,
      group: ++groupNumber,
    },
    [`enableTextToLinksForCurrentSite_${host}`]: {
      title: i("settings.enableTextToLinksForCurrentSite"),
      // Default false; only v2ex.com and localhost support
      defaultValue: Boolean(/v2ex\.com|localhost/.test(host)),
      group: ++groupNumber,
    },
    [`enableLinkToImgForCurrentSite_${host}`]: {
      title: i("settings.enableLinkToImgForCurrentSite"),
      // Default false; only v2ex.com and localhost support
      defaultValue: Boolean(/v2ex\.com|localhost/.test(host)),
      group: groupNumber,
    },
    eraseLinks: {
      title: i("settings.eraseLinks"),
      type: "action",
      async onclick() {
        hideSettings()
        eraseLinks()
      },
      group: ++groupNumber,
    },
    restoreLinks: {
      title: i("settings.restoreLinks"),
      type: "action",
      async onclick() {
        hideSettings()
        restoreLinks()
      },
      group: groupNumber,
    },
  }
}

const getOrigin = (url: string) => /(^https?:\/\/[^/]+)/.exec(url)?.[1]
const getWithoutOrigin = (url: string) => url.replace(/(^https?:\/\/[^/]+)/, "")

const currentBaseDomain = getBaseDomain(hostname)
const isSameBaseDomainWithCurrent = (a: string) =>
  getBaseDomain(a) === currentBaseDomain

const shouldOpenInNewTab = (element: HTMLAnchorElement) => {
  const url = element.href as string | undefined
  if (
    !url ||
    !/^https?:\/\//.test(url) ||
    element.getAttribute("href")?.startsWith("#") ||
    url === currentUrl
  ) {
    return false
  }

  // Open external links in a new tab
  if (element.origin !== origin) {
    // If enabled, treat subdomains as the same site and continue
    if (
      enableTreatSubdomainsSameSite &&
      isSameBaseDomainWithCurrent(element.hostname)
    ) {
      // Consider as internal; fall through to internal rules
    } else {
      return true
    }
  }

  // Open matched internal links in a new tab
  if (getSettingsValue(`enableCustomRulesForCurrentSite_${host}`)) {
    if (currentCanonicalId) {
      const canonicalId = extractCanonicalId(url)

      if (canonicalId && canonicalId === currentCanonicalId) {
        removeAttributeAsOpenInNewTab(element)
        return false
      }
    }

    const rules = (
      (getSettingsValue(`customRulesForCurrentSite_${host}`) as string) || ""
    ).split("\n")

    const hrefWithoutOrigin = getWithoutOrigin(url)
    for (let rule of rules) {
      rule = rule.trim()
      if (rule.length === 0) {
        continue
      }

      const isExclude = rule.startsWith("!")
      const pattern = isExclude ? rule.slice(1).trim() : rule
      if (pattern.length === 0) {
        continue
      }

      if (pattern === "*") {
        return !isExclude
      }

      try {
        const regexp = new RegExp(pattern)
        if (regexp.test(hrefWithoutOrigin)) {
          return !isExclude
        }
      } catch (error) {
        console.log(error.message)
        if (hrefWithoutOrigin.includes(pattern)) {
          return !isExclude
        }
      }
    }
  }
}

const setAttributeAsOpenInNewTab = (element: HTMLAnchorElement) => {
  if (!enableBackground && shouldOpenInNewTab(element)) {
    setAttribute(element, "target", "_blank")
    addAttribute(element, "rel", "noopener")
  }
}

const removeAttributeAsOpenInNewTab = (element: HTMLAnchorElement) => {
  removeAttribute(element, "target")
  removeAttribute(element, "rel")
}

function openInBackgroundTab(url: string) {
  if (
    // eslint-disable-next-line n/prefer-global/process
    process.env.PLASMO_TARGET === "chrome-mv3" ||
    // eslint-disable-next-line n/prefer-global/process
    process.env.PLASMO_TARGET === "firefox-mv3"
  ) {
    chrome.runtime.sendMessage({
      type: "open_background_tab",
      url,
    })
  } else if (typeof GM_openInTab === "function") {
    GM_openInTab(url, { active: false, insert: true })
  }
}

function onSettingsChange() {
  const locale =
    (getSettingsValue("locale") as string | undefined) || getPrefferedLocale()
  resetI18n(locale)
  enableTreatSubdomainsSameSite = Boolean(
    getSettingsValue(`enableTreatSubdomainsAsSameSiteForCurrentSite_${host}`)
  )
  enableBackground = Boolean(
    getSettingsValue(`enableOpenNewTabInBackgroundForCurrentSite_${host}`)
  )
  enableLinkToImg = Boolean(
    getSettingsValue(`enableLinkToImgForCurrentSite_${host}`)
  )
}

async function main() {
  await initSettings(() => {
    const settingsTable = getSettingsTable()
    return {
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
      availableLocales: getAvailableLocales(),
      async onValueChange() {
        onSettingsChange()
      },
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
    }
  })

  if (
    !getSettingsValue("enable") ||
    !getSettingsValue(`enableCurrentSite_${host}`)
  ) {
    return
  }

  onSettingsChange()

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
        const isNewTab = getAttribute(anchorElement, "target") === "_blank"
        const shouldOpenBackground =
          enableBackground &&
          shouldOpenInNewTab(anchorElement as HTMLAnchorElement)

        if (isNewTab || shouldOpenBackground) {
          event.stopImmediatePropagation()
          event.stopPropagation()

          if (shouldOpenBackground) {
            event.preventDefault()
            openInBackgroundTab(anchorElement.href)
          }
        }
      }
    },
    true
  )

  const scanAnchors = () => {
    // Update url if it has changed
    if (currentUrl !== location.href) {
      currentUrl = location.href
      currentCanonicalId = extractCanonicalId(currentUrl)
    }

    if (!enableLinkToImg && enableBackground) {
      return
    }

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

      if (enableLinkToImg) {
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
    if (getSettingsValue(`enableTextToLinksForCurrentSite_${host}`)) {
      scanAndConvertChildNodes(doc.body)
    }

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
    if (getSettingsValue(`enableTextToLinksForCurrentSite_${host}`)) {
      scanAndConvertChildNodes(doc.body)
    }
  })

  scanAnchors()
}

runWhenHeadExists(async () => {
  if (doc.documentElement.dataset.linksHelper === undefined) {
    doc.documentElement.dataset.linksHelper = ""
    await main()
  }
})

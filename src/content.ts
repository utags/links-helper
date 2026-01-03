import { getPrefferedLocale } from "browser-extension-i18n"
import {
  getSettingsValue,
  hideSettings,
  initSettings,
  showSettings,
  type SettingsTable,
} from "browser-extension-settings"
import { setPolling } from "browser-extension-storage"
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
import { handleLinkClick } from "./modules/click-handler"
import { eraseLinks, restoreLinks } from "./modules/erase-links"
import { bindOnError, linkToImg } from "./modules/link-to-img"
import { shouldOpenInNewTab as shouldOpenInNewTabFn } from "./modules/should-open-in-new-tab"
import { scanAndConvertChildNodes } from "./modules/text-to-links"
import { extractCanonicalId, getBaseDomain } from "./utils/index"

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface HTMLElement {
    __links_helper_scaned?: number
  }
}

const origin = location.origin
const host = location.host
const hostname = location.hostname
let currentUrl: string | undefined
let currentCanonicalId: string | undefined
let enableCustomRules = false
let customRules = ""
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
      void showSettings()
    }
  })
}

export const config: PlasmoCSConfig = {
  all_frames: true,
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

const currentBaseDomain = getBaseDomain(hostname)

const shouldOpenInNewTab = (element: HTMLAnchorElement) =>
  shouldOpenInNewTabFn(element, {
    currentUrl,
    currentCanonicalId,
    origin,
    host,
    currentBaseDomain,
    enableTreatSubdomainsSameSite,
    enableCustomRules,
    customRules,
    removeAttributeAsOpenInNewTab,
  })

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

function onSettingsChange() {
  const locale =
    getSettingsValue<string | undefined>("locale") || getPrefferedLocale()
  resetI18n(locale)

  enableCustomRules = Boolean(
    getSettingsValue<boolean | undefined>(
      `enableCustomRulesForCurrentSite_${host}`
    )
  )

  customRules =
    getSettingsValue<string | undefined>(`customRulesForCurrentSite_${host}`) ||
    ""

  enableTreatSubdomainsSameSite = Boolean(
    getSettingsValue<boolean | undefined>(
      `enableTreatSubdomainsAsSameSiteForCurrentSite_${host}`
    )
  )

  enableBackground = Boolean(
    getSettingsValue<boolean | undefined>(
      `enableOpenNewTabInBackgroundForCurrentSite_${host}`
    )
  )

  enableLinkToImg = Boolean(
    getSettingsValue<boolean | undefined>(
      `enableLinkToImgForCurrentSite_${host}`
    )
  )
}

async function main() {
  setPolling(true)

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
      handleLinkClick(event, {
        enableBackground,
        shouldOpenInNewTab,
        setAttributeAsOpenInNewTab,
      })
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

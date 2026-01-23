import { getPrefferedLocale } from 'browser-extension-i18n'
import {
  getSettingsValue,
  hideSettings,
  initSettings,
  showSettings,
  type SettingsTable,
} from 'browser-extension-settings'
import { setPolling } from 'browser-extension-storage'
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
} from 'browser-extension-utils'
import styleText from 'data-text:./content.scss'
import type { PlasmoCSConfig } from 'plasmo'

import { getAvailableLocales, i, resetI18n } from './messages'
import { handleLinkClick } from './modules/click-handler'
import { getAllAnchors } from './modules/dom-traversal'
import { eraseLinks, restoreLinks } from './modules/erase-links'
import {
  removeLinkTargetBlank,
  setLinkTargetToBlank,
} from './modules/link-attributes'
import {
  bindOnError,
  linkToImg,
  proxyExistingImages,
  restoreProxiedImages,
  setImageProxyOptions,
} from './modules/link-to-img'
import { shouldOpenInNewTab as shouldOpenInNewTabFn } from './modules/should-open-in-new-tab'
import { scanAndConvertChildNodes } from './modules/text-to-links'
import { extractCanonicalId, getBaseDomain } from './utils/index'

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
let customRules = ''
let enableTreatSubdomainsSameSite = false
let enableBackground = false
let enableOpenInternalLinksInCurrentTab = false
let enableLinkToImg = false
let enableTextToLinks = false
let enableImageProxy = false
let enableImageProxyWebp = false
let imageProxyDomains: string[] = []
let cachedFlag = 0

const IMAGE_PROXY_BLACKLIST = [
  'github.com',
  'mozilla.org',
  'google.com',
  'tiktok.com',
  'twitter.com',
  'x.com',
  'facebook.com',
  'instagram.com',
  'whatsapp.com',
  'discord.com',
  'image.baidu.com',
]

const STORAGE_KEY_CSP_RESTRICTED = 'links-helper:csp-restricted'

const isImageProxyBlacklisted = () =>
  IMAGE_PROXY_BLACKLIST.some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
  ) || Boolean(localStorage.getItem(STORAGE_KEY_CSP_RESTRICTED))

const handleCspDetected = () => {
  if (localStorage.getItem(STORAGE_KEY_CSP_RESTRICTED)) {
    return
  }

  // console.warn(
  //   '[Links Helper] CSP restriction detected for wsrv.nl. Disabling image proxy.'
  // )
  localStorage.setItem(STORAGE_KEY_CSP_RESTRICTED, 'true')

  // Update state
  enableImageProxy = false

  // Restore images
  restoreProxiedImages()
}

const detectCsp = () => {
  if (isImageProxyBlacklisted()) {
    return
  }

  // Listen for CSP violations
  doc.addEventListener('securitypolicyviolation', (e) => {
    if (
      e.blockedURI &&
      (e.blockedURI.includes('wsrv.nl') ||
        e.blockedURI.includes('external-content.duckduckgo.com'))
    ) {
      handleCspDetected()
    }
  })

  // setTimeout(() => {
  //   // Probe
  //   const img = doc.createElement('img')
  //   ;(doc.body || doc.head || doc.documentElement).appendChild(img)
  //   img.src = `https://wsrv.nl/?url=wsrv.nl/lichtenstein.jpg&w=1&h=1?t=${Date.now()}`
  //   // img.style.display = 'none'
  //   // img.onload = () => {
  //   //   img.remove()
  //   // }
  //   // img.onerror = () => {
  //   //   img.remove()
  //   // }
  // }, 1000)
}

if (
  // eslint-disable-next-line n/prefer-global/process
  process.env.PLASMO_TARGET === 'chrome-mv3' ||
  // eslint-disable-next-line n/prefer-global/process
  process.env.PLASMO_TARGET === 'firefox-mv3'
) {
  // Receive popup trigger to show settings in the content context
  const runtime =
    (globalThis as any).chrome?.runtime ?? (globalThis as any).browser?.runtime
  runtime?.onMessage?.addListener((message: any) => {
    if (message?.type === 'links-helper:show-settings') {
      void showSettings()
    }
  })
}

export const config: PlasmoCSConfig = {
  all_frames: true,
  run_at: 'document_start',
}

const getSettingsTable = (): SettingsTable => {
  let groupNumber = 1
  return {
    enable: {
      title: i('settings.enable'),
      defaultValue: true,
    },
    [`enableCurrentSite_${host}`]: {
      title: i('settings.enableCurrentSite'),
      defaultValue: true,
    },
    [`enableCustomRulesForCurrentSite_${host}`]: {
      title: i('settings.enableCustomRulesForTheCurrentSite'),
      defaultValue: false,
    },
    [`customRulesForCurrentSite_${host}`]: {
      title: i('settings.enableCustomRulesForTheCurrentSite'),
      defaultValue: '',
      placeholder: i('settings.customRulesPlaceholder'),
      type: 'textarea',
      group: ++groupNumber,
    },
    customRulesTip: {
      title: i('settings.customRulesTipTitle'),
      type: 'tip',
      tipContent: i('settings.customRulesTipContent'),
      group: groupNumber,
    },
    [`enableOpenNewTabInBackground`]: {
      title: i('settings.enableOpenNewTabInBackground'),
      defaultValue: false,
      group: ++groupNumber,
    },
    [`enableOpenNewTabInBackgroundForCurrentSite_${host}`]: {
      title: i('settings.enableOpenNewTabInBackgroundForCurrentSite'),
      defaultValue: undefined as any as boolean,
      group: groupNumber,
    },
    [`enableOpenInternalLinksInCurrentTab`]: {
      title: i('settings.enableOpenInternalLinksInCurrentTab'),
      defaultValue: false,
      group: ++groupNumber,
    },
    [`enableOpenInternalLinksInCurrentTabForCurrentSite_${host}`]: {
      title: i('settings.enableOpenInternalLinksInCurrentTabForCurrentSite'),
      defaultValue: undefined as any as boolean,
      group: groupNumber,
    },
    [`enableTreatSubdomainsAsSameSiteForCurrentSite_${host}`]: {
      title: i('settings.enableTreatSubdomainsAsSameSiteForCurrentSite'),
      defaultValue: false,
      group: ++groupNumber,
    },
    enableImageProxyForAllSites: {
      title: i('settings.enableImageProxyForAllSites'),
      defaultValue: false,
      group: ++groupNumber,
    },
    [`enableImageProxyForCurrentSite_${host}`]: {
      title: i('settings.enableImageProxyForCurrentSite'),
      defaultValue: undefined as any as boolean,
      group: groupNumber,
    },
    imageProxyDomains: {
      title: i('settings.imageProxyDomains'),
      defaultValue: 'i.imgur.com',
      placeholder: i('settings.imageProxyDomainsPlaceholder'),
      type: 'textarea',
      group: groupNumber,
    },
    imageProxyDomainsTip: {
      title: i('settings.imageProxyDomainsTipTitle'),
      type: 'tip',
      tipContent: i('settings.imageProxyDomainsTipContent'),
      group: groupNumber,
    },
    enableImageProxyConvertSvgToPng: {
      title: i('settings.enableImageProxyConvertSvgToPng'),
      defaultValue: false,
      group: groupNumber,
    },
    enableImageProxyWebp: {
      title: i('settings.enableImageProxyWebp'),
      defaultValue: false,
      group: groupNumber,
    },
    [`enableTextToLinksForCurrentSite_${host}`]: {
      title: i('settings.enableTextToLinksForCurrentSite'),
      // Default false; only v2ex.com and localhost support
      defaultValue: Boolean(/v2ex\.com|localhost/.test(host)),
      group: ++groupNumber,
    },
    [`enableLinkToImgForCurrentSite_${host}`]: {
      title: i('settings.enableLinkToImgForCurrentSite'),
      // Default false; only v2ex.com and localhost support
      defaultValue: Boolean(/v2ex\.com|localhost/.test(host)),
      group: groupNumber,
    },
    convertTextToLinks: {
      title: i('settings.convertTextToLinks'),
      type: 'action',
      async onclick() {
        hideSettings()
        scanAndConvertChildNodes(doc.body)
      },
      group: ++groupNumber,
    },
    convertLinksToImages: {
      title: i('settings.convertLinksToImages'),
      type: 'action',
      async onclick() {
        hideSettings()
        for (const element of getAllAnchors()) {
          try {
            linkToImg(element)
          } catch (error) {
            console.error(error)
          }
        }
      },
      group: groupNumber,
    },
    eraseLinks: {
      title: i('settings.eraseLinks'),
      type: 'action',
      async onclick() {
        hideSettings()
        eraseLinks()
      },
      group: groupNumber,
    },
    restoreLinks: {
      title: i('settings.restoreLinks'),
      type: 'action',
      async onclick() {
        hideSettings()
        restoreLinks()
      },
      group: groupNumber,
    },
  }
}

const currentBaseDomain = getBaseDomain(hostname)

const shouldOpenInNewTab = (element: HTMLAnchorElement): boolean =>
  shouldOpenInNewTabFn(element, {
    currentUrl,
    currentCanonicalId,
    origin,
    host,
    currentBaseDomain,
    enableTreatSubdomainsSameSite,
    enableCustomRules,
    customRules,
  })

function onSettingsChange() {
  cachedFlag++
  const locale =
    getSettingsValue<string | undefined>('locale') || getPrefferedLocale()
  resetI18n(locale)

  enableCustomRules = Boolean(
    getSettingsValue<boolean | undefined>(
      `enableCustomRulesForCurrentSite_${host}`
    )
  )

  customRules =
    getSettingsValue<string | undefined>(`customRulesForCurrentSite_${host}`) ||
    ''

  enableTreatSubdomainsSameSite = Boolean(
    getSettingsValue<boolean | undefined>(
      `enableTreatSubdomainsAsSameSiteForCurrentSite_${host}`
    )
  )

  {
    const siteSetting = getSettingsValue<boolean | undefined>(
      `enableImageProxyForCurrentSite_${host}`
    )
    const globalSetting = getSettingsValue<boolean | undefined>(
      'enableImageProxyForAllSites'
    )
    enableImageProxy = isImageProxyBlacklisted()
      ? false
      : Boolean(siteSetting ?? globalSetting)
  }

  {
    const domainsValue =
      getSettingsValue<string | undefined>('imageProxyDomains') || 'i.imgur.com'
    imageProxyDomains = domainsValue
      .split(/[\s,]+/)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  enableImageProxyWebp = Boolean(
    getSettingsValue<boolean | undefined>('enableImageProxyWebp')
  )
  const enableImageProxyConvertSvgToPng = Boolean(
    getSettingsValue<boolean | undefined>('enableImageProxyConvertSvgToPng')
  )

  setImageProxyOptions({
    enableProxy: enableImageProxy,
    domains: imageProxyDomains,
    enableWebp: enableImageProxyWebp,
    enableConvertSvgToPng: enableImageProxyConvertSvgToPng,
  })

  {
    const siteSetting = getSettingsValue<boolean | undefined>(
      `enableOpenNewTabInBackgroundForCurrentSite_${host}`
    )
    const globalSetting = getSettingsValue<boolean | undefined>(
      `enableOpenNewTabInBackground`
    )
    enableBackground = Boolean(siteSetting ?? globalSetting)
    // if (
    //   globalSetting !== undefined &&
    //   siteSetting !== undefined &&
    //   globalSetting === siteSetting
    // ) {
    //   setSettingsValue<boolean | undefined>(
    //     `enableOpenNewTabInBackgroundForCurrentSite_${host}`,
    //     undefined
    //   )
    // }
  }

  {
    const siteSetting = getSettingsValue<boolean | undefined>(
      `enableOpenInternalLinksInCurrentTabForCurrentSite_${host}`
    )
    const globalSetting = getSettingsValue<boolean | undefined>(
      `enableOpenInternalLinksInCurrentTab`
    )
    enableOpenInternalLinksInCurrentTab = Boolean(siteSetting ?? globalSetting)
  }

  enableLinkToImg = Boolean(
    getSettingsValue<boolean | undefined>(
      `enableLinkToImgForCurrentSite_${host}`
    )
  )

  enableTextToLinks = Boolean(
    getSettingsValue<boolean | undefined>(
      `enableTextToLinksForCurrentSite_${host}`
    )
  )

  scanNodes()
}

const scanAnchors = () => {
  // Update url if it has changed
  if (currentUrl !== location.href) {
    currentUrl = location.href
    currentCanonicalId = extractCanonicalId(currentUrl)
  }

  let elementCount = 0
  for (const element of getAllAnchors()) {
    if (element.__links_helper_scaned === cachedFlag) {
      continue
    }

    elementCount++

    element.__links_helper_scaned = cachedFlag
    try {
      if (shouldOpenInNewTab(element)) {
        setLinkTargetToBlank(element)
      } else if (enableOpenInternalLinksInCurrentTab) {
        removeLinkTargetBlank(element)
      }
    } catch (error) {
      console.error(error)
    }

    if (enableLinkToImg) {
      try {
        linkToImg(element)
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
  if (enableTextToLinks) {
    scanAndConvertChildNodes(doc.body)
  }

  scanAnchors()

  if (enableImageProxy && imageProxyDomains.length > 0) {
    proxyExistingImages(cachedFlag)
  }

  bindOnError()
}, 500)

async function main() {
  detectCsp()
  setPolling(true)

  await initSettings(() => {
    const settingsTable = getSettingsTable()
    return {
      id: 'links-helper',
      title: i('settings.title'),
      footer: `
    <p>${i('settings.information')}</p>
    <p>
    <a href="https://github.com/utags/links-helper/issues" target="_blank">
    ${i('settings.report')}
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
            ? 'block'
            : 'none'
        }

        {
          const siteSetting = getSettingsValue<boolean | undefined>(
            `enableOpenInternalLinksInCurrentTabForCurrentSite_${host}`
          )
          const globalSetting = getSettingsValue<boolean | undefined>(
            `enableOpenInternalLinksInCurrentTab`
          )
          if (globalSetting !== undefined && siteSetting === undefined) {
            const checkbox = settingsMainView.querySelector(
              `[data-key="enableOpenInternalLinksInCurrentTabForCurrentSite_${host}"] input[type="checkbox"]`
            )
            if (checkbox) {
              ;(checkbox as HTMLInputElement).checked = globalSetting
            }
          }
        }

        {
          const siteSetting = getSettingsValue<boolean | undefined>(
            `enableOpenNewTabInBackgroundForCurrentSite_${host}`
          )
          const globalSetting = getSettingsValue<boolean | undefined>(
            `enableOpenNewTabInBackground`
          )
          if (globalSetting !== undefined && siteSetting === undefined) {
            const checkbox = settingsMainView.querySelector(
              `[data-key="enableOpenNewTabInBackgroundForCurrentSite_${host}"] input[type="checkbox"]`
            )
            if (checkbox) {
              ;(checkbox as HTMLInputElement).checked = globalSetting
            }
          }
        }

        {
          const siteSetting = getSettingsValue<boolean | undefined>(
            `enableImageProxyForCurrentSite_${host}`
          )
          const globalSetting = getSettingsValue<boolean | undefined>(
            `enableImageProxyForAllSites`
          )

          if (isImageProxyBlacklisted()) {
            const checkbox = settingsMainView.querySelector(
              `[data-key="enableImageProxyForCurrentSite_${host}"] input[type="checkbox"]`
            )
            if (checkbox) {
              ;(checkbox as HTMLInputElement).checked = false
              ;(checkbox as HTMLInputElement).disabled = true
            }
          } else if (globalSetting !== undefined && siteSetting === undefined) {
            const checkbox = settingsMainView.querySelector(
              `[data-key="enableImageProxyForCurrentSite_${host}"] input[type="checkbox"]`
            )
            if (checkbox) {
              ;(checkbox as HTMLInputElement).checked = globalSetting
            }
          }
        }

        {
          const enableTextToLinks = getSettingsValue<boolean>(
            `enableTextToLinksForCurrentSite_${host}`
          )
          const element = settingsMainView.querySelector(
            `[data-key="convertTextToLinks"]`
          )
          if (element) {
            ;(element as HTMLElement).style.display = enableTextToLinks
              ? 'none'
              : 'block'
          }
        }

        {
          const enableLinkToImg = getSettingsValue<boolean>(
            `enableLinkToImgForCurrentSite_${host}`
          )
          const element = settingsMainView.querySelector(
            `[data-key="convertLinksToImages"]`
          )
          if (element) {
            ;(element as HTMLElement).style.display = enableLinkToImg
              ? 'none'
              : 'block'
          }
        }
      },
    }
  })

  if (
    !getSettingsValue('enable') ||
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
    'click',
    (event) => {
      handleLinkClick(event, {
        enableBackground,
        enableOpenInternalLinksInCurrentTab,
        hostname,
        shouldOpenInNewTab,
      })
    },
    true
  )

  const observer = new MutationObserver((mutationsList) => {
    // console.error("mutation", Date.now(), mutationsList)
    if (enableImageProxy) {
      let hasImg = false
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          for (const node of mutation.addedNodes) {
            if (node.nodeName === 'IMG') {
              hasImg = true
              break
            }

            if (node.nodeType === 1 && (node as Element).querySelector('img')) {
              hasImg = true
              break
            }
          }
        }

        if (hasImg) break
      }

      if (hasImg) {
        proxyExistingImages(cachedFlag)
      }
    }

    scanNodes()
  })

  const observeShadow = (root: ShadowRoot) => {
    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
    })
  }

  const originalAttachShadow = Element.prototype.attachShadow
  if (originalAttachShadow) {
    Element.prototype.attachShadow = function (init) {
      const shadowRoot = originalAttachShadow.call(this, init) as ShadowRoot
      observeShadow(shadowRoot)
      return shadowRoot
    }
  }

  const startObserver = () => {
    observer.observe(doc.body, {
      // attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
    })

    const scanAndObserveShadowRoots = (root: ParentNode) => {
      const elements = root.querySelectorAll('*')
      for (const element of elements) {
        if (element.shadowRoot) {
          observeShadow(element.shadowRoot)
          scanAndObserveShadowRoots(element.shadowRoot)
        }
      }
    }

    scanAndObserveShadowRoots(doc.body)
  }

  runWhenBodyExists(() => {
    startObserver()
  })

  scanNodes()
}

runWhenHeadExists(async () => {
  if (doc.documentElement.dataset.linksHelper === undefined) {
    doc.documentElement.dataset.linksHelper = ''
    await main()
  }
})

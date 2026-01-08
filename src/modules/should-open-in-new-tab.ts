import { extractCanonicalId, getBaseDomain } from '../utils/index'
import { removeLinkTargetBlank } from './link-attributes'

export type LinkHelperContext = {
  currentUrl?: string
  currentCanonicalId?: string
  origin: string
  host: string
  currentBaseDomain?: string
  enableTreatSubdomainsSameSite: boolean
  enableCustomRules: boolean
  customRules: string
}

const getWithoutOrigin = (url: string) => url.replace(/(^https?:\/\/[^/]+)/, '')

const getCanonicalHost = (host: string) => host.replace(/^www\./, '')

export const shouldOpenInNewTab = (
  element: HTMLAnchorElement,
  context: LinkHelperContext
  // eslint-disable-next-line complexity
): boolean => {
  const {
    currentUrl,
    currentCanonicalId,
    origin,
    host,
    currentBaseDomain,
    enableTreatSubdomainsSameSite,
    enableCustomRules,
    customRules,
  } = context

  const url = element.href as string | undefined
  if (
    !url ||
    !/^https?:\/\//.test(url) ||
    element.getAttribute('href')?.startsWith('#') ||
    url === currentUrl
  ) {
    return false
  }

  // Open external links in a new tab
  if (getCanonicalHost(element.host) !== getCanonicalHost(host)) {
    // If enabled, treat subdomains as the same site and continue
    if (
      enableTreatSubdomainsSameSite &&
      currentBaseDomain &&
      getBaseDomain(element.hostname) === currentBaseDomain
    ) {
      // Consider as internal; fall through to internal rules
    } else {
      return true
    }
  }

  const rules = (customRules || '').split('\n')

  // Open matched internal links in a new tab
  if (enableCustomRules && rules.length > 0) {
    if (currentCanonicalId) {
      const canonicalId = extractCanonicalId(url)

      if (canonicalId && canonicalId === currentCanonicalId) {
        removeLinkTargetBlank(element)
        return false
      }
    }

    const hrefWithoutOrigin = getWithoutOrigin(url)
    for (let rule of rules) {
      rule = rule.trim()
      if (rule.length === 0) {
        continue
      }

      const isExclude = rule.startsWith('!')
      const pattern = isExclude ? rule.slice(1).trim() : rule
      if (pattern.length === 0) {
        continue
      }

      if (pattern === '*') {
        return !isExclude
      }

      try {
        const regexp = new RegExp(pattern)
        if (regexp.test(hrefWithoutOrigin)) {
          return !isExclude
        }
      } catch (error: any) {
        console.log(error.message)
        if (hrefWithoutOrigin.includes(pattern)) {
          return !isExclude
        }
      }
    }
  }

  return false
}

const messages = {
  'settings.enable': 'Enable for all sites',
  'settings.enableCurrentSite': 'Enable for the current site',
  'settings.enableCustomRulesForTheCurrentSite': 'Enable custom rules for the current site',
  'settings.customRulesPlaceholder': '/* Custom rules for internal URLs, matching URLs will be opened in new tabs */',
  'settings.customRulesTipTitle': 'Examples',
  'settings.customRulesTipContent': `<p>Custom rules for internal URLs, matching URLs will be opened in new tabs</p>
  <p>
  - One line per url pattern<br>
  - All URLs contains '/posts' or '/users/'<br>
  <pre>/posts/
/users/</pre>

  - Regex is supported<br>
  <pre>^/(posts|members)/d+</pre>

  - '*' for all URLs<br>
  - Exclusion rules: prefix '!' to exclude matching URLs<br>
  <pre>!/posts/
!^/users/\\d+
!*</pre>
  </p>`,
  'settings.enableLinkToImgForCurrentSite': 'Enable converting image links to image tags for the current site',
  'settings.enableTextToLinksForCurrentSite': 'Enable converting text links to hyperlinks for the current site',
  'settings.enableTreatSubdomainsAsSameSiteForCurrentSite': 'Treat subdomains as the same site for the current site',
  'settings.enableOpenInternalLinksInCurrentTab': 'Open internal links in current tab for *all sites* (override default)',
  'settings.enableOpenInternalLinksInCurrentTabForCurrentSite': 'Open internal links in current tab for the current site (override default)',
  'settings.enableOpenNewTabInBackground': 'Open new tab in background for *all sites*',
  'settings.enableOpenNewTabInBackgroundForCurrentSite': 'Open new tab in background for the current site',
  'settings.enableImageProxyForAllSites': 'Enable image proxy for *all sites*',
  'settings.enableImageProxyForCurrentSite': 'Enable image proxy for the current site',
  'settings.imageProxyDomains': 'Image proxy domains',
  'settings.imageProxyDomainsPlaceholder': '/* One domain per line, use "!" to exclude, "*" for all domains */',
  'settings.imageProxyDomainsTipTitle': 'Image proxy domain examples',
  'settings.imageProxyDomainsTipContent': `<p>Image proxy domain list</p>
  <p>
  - One domain per line (without http/https)<br>
  - '*' matches all domains<br>
  - Exclusion rules: prefix '!' to exclude specific domains<br>
  <pre>i.imgur.com
imgur.com
!abc.com
*</pre>
  </p>`,
  'settings.enableImageProxyWebp': 'Convert proxied images to WebP when possible',
  'settings.convertTextToLinks': 'Convert text links to hyperlinks',
  'settings.convertLinksToImages': 'Convert image links to image tags',
  'settings.eraseLinks': 'Erase Links',
  'settings.restoreLinks': 'Restore Links',

  'settings.title': '🔗 Links Helper',
  'settings.information': 'After changing the settings, reload the page to take effect',
  'settings.report': 'Report and Issue...',
  'popup.settings': 'Settings',
}

export default messages

const messages = {
  "settings.enable": "Enable",
  "settings.enableCurrentSite": "Enable on current site",
  "settings.enableCustomRulesForTheCurrentSite": "Enable custom rules for the current site",
  "settings.customRulesPlaceholder": "/* Custom rules for internal URLs, matching URLs will be opened in new tabs */",
  "settings.customRulesTipTitle": "Examples",
  "settings.customRulesTipContent": `<p>Custom rules for internal URLs, matching URLs will be opened in new tabs</p>
  <p>
  - One line per url pattern<br>
  - All URLs contains '/posts' or '/users/'<br>
  <pre>/posts/
/users/</pre>

  - Regex is supported<br>
  <pre>^/(posts|members)/d+</pre>

  - '*' for all URLs
  </p>`,
  "settings.enableLinkToImgForCurrentSite": "Enable converting image links to image tags for the current site",
  "settings.eraseLinks": "Erase Links",
  "settings.restoreLinks": "Restore Links",

  "settings.title": "🔗 Links Helper",
  "settings.information": "After changing the settings, reload the page to take effect",
  "settings.report": "Report and Issue...",
}

export default messages

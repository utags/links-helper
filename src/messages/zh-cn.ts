export const messages = {
  'settings.enable': '在所有网站启用',
  'settings.enableCurrentSite': '在当前网站启用',
  'settings.enableCustomRulesForTheCurrentSite': '在当前网站启用自定义规则',
  'settings.customRulesPlaceholder': '/* 内部链接的自定义规则，匹配的链接会在新窗口打开 */',
  'settings.customRulesTipTitle': '示例',
  'settings.customRulesTipContent': `<p>内部链接的自定义规则，匹配的链接会在新窗口打开</p>
  <p>
  - 每行一条规则<br>
  - 所有包含 '/posts' 或 '/users/' 的链接<br>
  <pre>/posts/
/users/</pre>

  - 支持正则表达式<br>
  <pre>^/(posts|members)/d+</pre>

  - '*' 代表匹配所有链接<br>
  - 排除规则：以 '!' 开头，匹配则排除（不在新窗口打开）<br>
  <pre>!/posts/
!^/users/\\d+
!*</pre>
  </p>`,
  'settings.enableLinkToImgForCurrentSite': '在当前网站启用将图片链接自动转换为图片标签',
  'settings.enableTextToLinksForCurrentSite': '在当前网站启用将文本链接解析为超链接',
  'settings.enableTreatSubdomainsAsSameSiteForCurrentSite': '在当前网站启用将二级域名视为同一网站',
  'settings.enableOpenInternalLinksInCurrentTab': '在*所有网站*启用在当前标签页打开站内链接（覆盖网站默认行为）',
  'settings.enableOpenInternalLinksInCurrentTabForCurrentSite': '在当前网站启用在当前标签页打开站内链接（覆盖网站默认行为）',
  'settings.enableOpenNewTabInBackground': '在*所有网站*启用在后台打开新标签页',
  'settings.enableOpenNewTabInBackgroundForCurrentSite': '在当前网站启用在后台打开新标签页',
  'settings.enableImageProxyForAllSites': '在*所有网站*启用将图片链接转为代理链接',
  'settings.enableImageProxyForCurrentSite': '在当前网站启用将图片链接转为代理链接',
  'settings.imageProxyDomains': '要通过代理加载的图片域名',
  'settings.imageProxyDomainsPlaceholder': '/* 每行一个域名，支持使用 "!" 排除，"*" 代表全部域名 */',
  'settings.imageProxyDomainsTipTitle': '图片代理域名示例',
  'settings.imageProxyDomainsTipContent': `<p>图片代理域名列表</p>
  <p>
  - 每行一个域名（不需要 http/https）<br>
  - '*' 代表匹配所有域名<br>
  - 排除规则：以 '!' 开头表示排除对应域名<br>
  <pre>i.imgur.com
imgur.com
!abc.com
*</pre>
  </p>`,
  'settings.enableImageProxyWebp': '将代理图片尽量转换为 WebP 格式',
  'settings.enableImageProxyConvertSvgToPng': '代理 SVG 图片（转换为 PNG）',
  'settings.convertTextToLinks': '将文本链接转换为超链接',
  'settings.convertLinksToImages': '将图片链接转换为图片标签',
  'settings.eraseLinks': '去除指定区域的链接',
  'settings.restoreLinks': '恢复去除的链接',

  'settings.title': '🔗 链接助手',
  'settings.information': '更改设置后，重新加载页面即可生效',
  'settings.report': '反馈问题',
  'popup.settings': '设置',
}

export default messages

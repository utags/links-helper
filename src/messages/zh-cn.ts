export const messages = {
  "settings.enable": "启用脚本",
  "settings.enableCurrentSite": "在当前网站启用脚本",
  "settings.enableCustomRulesForTheCurrentSite": "在当前网站启用自定义规则",
  "settings.customRulesPlaceholder": "/* 内部链接的自定义规则，匹配的链接会在新窗口打开 */",
  "settings.customRulesTipTitle": "示例",
  "settings.customRulesTipContent": `<p>内部链接的自定义规则，匹配的链接会在新窗口打开</p>
  <p>
  - 每行一条规则<br>
  - 所有包含 '/posts' 或 '/users/' 的链接<br>
  <pre>/posts/
/users/</pre>

  - 支持正则表达式<br>
  <pre>^/(posts|members)/d+</pre>

  - '*' 代表匹配所有链接
  </p>`,
  "settings.enableLinkToImgForCurrentSite": "在当前网站启用图片链接自动转换为图片标签",
  "settings.enableTextToLinksForCurrentSite": "在当前网站启用解析文本链接为超链接",
  "settings.eraseLinks": "去除指定区域的链接",
  "settings.restoreLinks": "恢复去除的链接",

  "settings.title": "🔗 链接助手",
  "settings.information": "更改设置后，重新加载页面即可生效",
  "settings.report": "反馈问题",
}

export default messages

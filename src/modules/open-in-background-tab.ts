export const openInBackgroundTab = (url: string) => {
  if (
    // eslint-disable-next-line n/prefer-global/process
    process.env.PLASMO_TARGET === "chrome-mv3" ||
    // eslint-disable-next-line n/prefer-global/process
    process.env.PLASMO_TARGET === "firefox-mv3"
  ) {
    void chrome.runtime.sendMessage({
      type: "open_background_tab",
      url,
    })
    return
  }

  if (typeof GM !== "undefined" && typeof GM.openInTab === "function") {
    void GM.openInTab(url, { active: false, insert: true })
    return
  }

  if (typeof GM_openInTab === "function") {
    GM_openInTab(url, { active: false, insert: true })
    return
  }

  globalThis.open(url, "_blank")
  globalThis.focus()
}

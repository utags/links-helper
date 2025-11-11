// background.ts - Background script to handle opening tabs in the background

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "open_background_tab") {
    const senderTabId = sender.tab?.id
    if (senderTabId === undefined) {
      // Fallback if no sender tab
      chrome.tabs.create({ url: message.url, active: false }, (newTab) => {
        sendResponse({ success: true, tabId: newTab?.id })
      })
    } else {
      chrome.tabs.get(senderTabId, (openerTab) => {
        const newTabIndex = openerTab.index + 1
        chrome.tabs.create(
          {
            url: message.url,
            active: false,
            index: newTabIndex,
            openerTabId: senderTabId,
          },
          (newTab) => {
            sendResponse({ success: true, tabId: newTab?.id })
          }
        )
      })
    }

    return true // Indicate async response
  }
})

import {
  addValueChangeListener,
  getValue,
  setValue,
} from "browser-extension-storage"
import {
  $,
  addElement,
  addEventListener,
  addStyle,
  removeEventListener,
} from "browser-extension-utils"
import styleText from "data-text:./style.scss"

import { createSwitchOption } from "./switch"

const settingsElementId =
  "browser_extension_settings_" + String(Math.round(Math.random() * 10_000))
const getSettingsElement = () => $("#" + settingsElementId)
const getSettingsStyle = () =>
  styleText.replace(/browser_extension_settings/gm, settingsElementId)
const storageKey = "settings"

let settingsOptions = {}
let settingsTable = {}
let settings = {}
async function getSettings() {
  return (
    ((await getValue(storageKey)) as Record<string, unknown> | undefined) ?? {}
  )
}

async function saveSattingsValue(key: string, value: any) {
  const settings = await getSettings()
  settings[key] =
    settingsTable[key] && settingsTable[key].defaultValue === value
      ? undefined
      : value

  await setValue(storageKey, settings)
}

export function getSettingsValue(key: string): boolean | string | undefined {
  return Object.hasOwn(settings, key)
    ? settings[key]
    : settingsTable[key]?.defaultValue
}

const modalHandler = (event) => {
  let target = event.target as HTMLElement
  const settingsLayer = getSettingsElement()
  if (settingsLayer) {
    while (target !== settingsLayer && target) {
      target = target.parentNode as HTMLElement
    }

    if (target === settingsLayer) {
      return
    }

    settingsLayer.style.display = "none"
  }

  removeEventListener(document, "click", modalHandler)
}

async function updateOptions() {
  if (!getSettingsElement()) {
    return
  }

  for (const key in settingsTable) {
    if (Object.hasOwn(settingsTable, key)) {
      const checkbox = $(
        `#${settingsElementId} .option_groups .switch_option[data-key="${key}"] input`
      )
      if (checkbox) {
        checkbox.checked = getSettingsValue(key)
      }
    }
  }

  const host = location.host
  const group2 = $(`#${settingsElementId} .option_groups:nth-of-type(2)`)
  if (group2) {
    group2.style.display = getSettingsValue(
      `enableCustomRulesForCurrentSite_${host}`
    )
      ? "block"
      : "none"
  }

  const customStyleValue = $(`#${settingsElementId} .option_groups textarea`)
  if (customStyleValue) {
    customStyleValue.value = settings[`customRulesForCurrentSite_${host}`] || ""
  }
}

function createSettingsElement() {
  let settingsLayer = getSettingsElement()
  if (!settingsLayer) {
    addStyle(getSettingsStyle())
    settingsLayer = addElement(document.body, "div", {
      id: settingsElementId,
    })

    if (settingsOptions.title) {
      addElement(settingsLayer, "h2", { textContent: settingsOptions.title })
    }

    const options = addElement(settingsLayer, "div", { class: "option_groups" })
    for (const key in settingsTable) {
      if (Object.hasOwn(settingsTable, key)) {
        const item = settingsTable[key]
        if (!item.type || item.type === "switch") {
          const switchOption = createSwitchOption(item.title, {
            async onchange(event) {
              await saveSattingsValue(key, event.target.checked)
            },
          })

          switchOption.dataset.key = key

          addElement(options, switchOption)
        }
      }
    }

    const options2 = addElement(settingsLayer, "div", {
      class: "option_groups",
    })
    let timeoutId
    addElement(options2, "textarea", {
      placeholder: `/* Custom rules for internal URLs, matching URLs will be opened in new tabs */`,
      onkeyup(event) {
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }

        timeoutId = setTimeout(async () => {
          const host = location.host
          await saveSattingsValue(
            `customRulesForCurrentSite_${host}`,
            event.target.value.trim()
          )
        }, 100)
      },
    })

    const tip = addElement(options2, "div", {
      class: "tip",
    })
    addElement(tip, "a", {
      class: "tip_anchor",
      textContent: "Examples",
    })
    const tipContent = addElement(tip, "div", {
      class: "tip_content",
      innerHTML: `<p>Custom rules for internal URLs, matching URLs will be opened in new tabs</p>
      <p>
      - One line per url pattern<br>
      - All URLs contains '/posts' or '/users/'<br>
      <pre>/posts/
/users/</pre>

      - Regex is supported<br>
      <pre>^/(posts|members)/d+</pre>

      - '*' for all URLs
      </p>`,
    })

    if (settingsOptions.footer) {
      const footer = addElement(settingsLayer, "footer")
      footer.innerHTML =
        typeof settingsOptions.footer === "string"
          ? settingsOptions.footer
          : `<p>Made with ❤️ by
      <a href="https://www.pipecraft.net/" target="_blank">
        Pipecraft
      </a></p>`
    }
  }

  return settingsLayer
}

export async function showSettings() {
  const settingsLayer = createSettingsElement()
  await updateOptions()
  settingsLayer.style.display = "block"

  addEventListener(document, "click", modalHandler)
}

export const initSettings = async (options) => {
  settingsOptions = options
  settingsTable = options.settingsTable || {}
  addValueChangeListener(storageKey, async () => {
    settings = await getSettings()
    await updateOptions()
  })

  settings = await getSettings()
}

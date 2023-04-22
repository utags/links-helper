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
  settings[key] = value
  await setValue(storageKey, settings)
}

export function getSettingsValue(key: string): boolean | undefined {
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
        const switchOption = createSwitchOption(item.title, {
          async onchange(event) {
            await saveSattingsValue(key, event.target.checked)
          },
        })

        switchOption.dataset.key = key

        addElement(options, switchOption)
      }
    }

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

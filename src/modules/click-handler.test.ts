import * as utils from 'browser-extension-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { openInBackgroundTab } from '../modules/open-in-background-tab'
import {
  handleLinkClick,
  isBlacklisted,
  type ClickHandlerDeps,
} from './click-handler'
import { removeLinkTargetBlank, setLinkTargetToBlank } from './link-attributes'

vi.mock('./link-attributes', () => ({
  setLinkTargetToBlank: vi.fn(),
  removeLinkTargetBlank: vi.fn(),
}))

vi.mock('../modules/open-in-background-tab', () => ({
  openInBackgroundTab: vi.fn(),
}))

vi.mock('browser-extension-utils', () => ({
  getAttribute: vi.fn(),
  hasClass: vi.fn((el, cls) => el.classList?.contains(cls) as boolean),
}))

describe('handleLinkClick', () => {
  const deps: ClickHandlerDeps = {
    enableBackground: false,
    enableOpenInternalLinksInCurrentTab: false,
    hostname: 'www.example.com',
    shouldOpenInNewTab: vi.fn(),
  }

  let event: any
  let target: any

  beforeEach(() => {
    vi.clearAllMocks()
    target = document.createElement('a')
    event = {
      target,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      stopImmediatePropagation: vi.fn(),
    }
    // Mock closest
    target.closest = vi.fn().mockReturnValue(null)
  })

  it('should handle clicks in shadow DOM using composedPath', () => {
    const shadowHost = document.createElement('div')
    const shadowRoot = shadowHost.attachShadow({ mode: 'open' })
    const shadowLink = document.createElement('a')
    shadowLink.href = 'https://shadow.com'
    shadowRoot.append(shadowLink)
    document.body.append(shadowHost)

    event.composedPath = vi
      .fn()
      .mockReturnValue([
        shadowLink,
        shadowRoot,
        shadowHost,
        document.body,
        document,
        globalThis,
      ])
    event.target = shadowHost // The target usually appears as the host for outside listeners

    vi.mocked(utils.getAttribute).mockReturnValue('_self')
    const depsWithBg = { ...deps, enableBackground: true }
    vi.mocked(depsWithBg.shouldOpenInNewTab).mockReturnValue(true)

    handleLinkClick(event as unknown as MouseEvent, depsWithBg)

    expect(setLinkTargetToBlank).toHaveBeenCalledWith(shadowLink)
    expect(openInBackgroundTab).toHaveBeenCalledWith('https://shadow.com/')
  })

  it('should do nothing if target is null', () => {
    event.target = null
    handleLinkClick(event as unknown as MouseEvent, deps)
    expect(setLinkTargetToBlank).not.toHaveBeenCalled()
  })

  it('should find anchor element if clicked on child', () => {
    const span = document.createElement('span')
    target.append(span)
    event.target = span
    // Real DOM traversal works in jsdom
    vi.mocked(deps.shouldOpenInNewTab).mockReturnValue(true)

    handleLinkClick(event as unknown as MouseEvent, deps)
    expect(setLinkTargetToBlank).toHaveBeenCalledWith(target)
  })

  it('should call setLinkTargetToBlank', () => {
    vi.mocked(deps.shouldOpenInNewTab).mockReturnValue(true)
    handleLinkClick(event as unknown as MouseEvent, deps)
    expect(setLinkTargetToBlank).toHaveBeenCalledWith(target)
  })

  it('should not stop propagation if not opening in new tab', () => {
    vi.mocked(utils.getAttribute).mockReturnValue('_self')
    vi.mocked(deps.shouldOpenInNewTab).mockReturnValue(false)

    handleLinkClick(event as unknown as MouseEvent, deps)
    expect(event.stopImmediatePropagation).not.toHaveBeenCalled()
  })

  it('should stop propagation if target is _blank', () => {
    vi.mocked(utils.getAttribute).mockReturnValue('_blank')

    handleLinkClick(event as unknown as MouseEvent, deps)
    expect(event.stopImmediatePropagation).toHaveBeenCalled()
    expect(event.stopPropagation).toHaveBeenCalled()
  })

  it('should open in background if enabled and shouldOpenInNewTab is true', () => {
    const depsWithBg = { ...deps, enableBackground: true }
    vi.mocked(depsWithBg.shouldOpenInNewTab).mockReturnValue(true)
    vi.mocked(utils.getAttribute).mockReturnValue('_self')
    target.href = 'https://example.com'

    handleLinkClick(event as unknown as MouseEvent, depsWithBg)

    expect(event.stopImmediatePropagation).toHaveBeenCalled()
    expect(event.preventDefault).toHaveBeenCalled()
    expect(openInBackgroundTab).toHaveBeenCalledWith('https://example.com/')
  })

  it('should remove target=_blank when enableOpenInternalLinksInCurrentTab is true and not opening in new tab', () => {
    const depsCurrentTab = {
      ...deps,
      enableOpenInternalLinksInCurrentTab: true,
    }
    vi.mocked(depsCurrentTab.shouldOpenInNewTab).mockReturnValue(false)
    vi.mocked(utils.getAttribute).mockReturnValue('_blank')
    target.href = 'https://example.com/internal'

    handleLinkClick(event as unknown as MouseEvent, depsCurrentTab)

    expect(event.stopImmediatePropagation).not.toHaveBeenCalled()
    expect(event.stopPropagation).not.toHaveBeenCalled()
    expect(setLinkTargetToBlank).not.toHaveBeenCalled()
    expect(removeLinkTargetBlank).toHaveBeenCalledWith(target)
  })

  it('should not remove target when shouldOpenInNewTab is true even if enableOpenInternalLinksInCurrentTab is true', () => {
    const depsCurrentTab = {
      ...deps,
      enableOpenInternalLinksInCurrentTab: true,
    }
    vi.mocked(depsCurrentTab.shouldOpenInNewTab).mockReturnValue(true)
    vi.mocked(utils.getAttribute).mockReturnValue('_blank')
    target.href = 'https://example.com/open'

    handleLinkClick(event as unknown as MouseEvent, depsCurrentTab)

    expect(setLinkTargetToBlank).toHaveBeenCalledWith(target)
    expect(event.stopImmediatePropagation).toHaveBeenCalled()
    expect(removeLinkTargetBlank).not.toHaveBeenCalled()
  })

  it('should return early if target is blacklisted in composedPath', () => {
    // Case 1: The clicked element itself is blacklisted
    const blacklistedEl = document.createElement('div')
    blacklistedEl.classList.add('bili-watch-later')
    event.composedPath = vi.fn().mockReturnValue([blacklistedEl, target])

    handleLinkClick(event as unknown as MouseEvent, deps)

    expect(setLinkTargetToBlank).not.toHaveBeenCalled()
    expect(deps.shouldOpenInNewTab).not.toHaveBeenCalled()
  })

  it('should return early if ancestor is blacklisted (traversal)', () => {
    // Case 2: Traversing up from target, encounter blacklisted element before finding 'A'
    const blacklistedParent = document.createElement('div')
    blacklistedParent.classList.add('bili-watch-later')
    const span = document.createElement('span')
    blacklistedParent.append(span)
    // We don't need to append to 'target' (the anchor) for this test if we want to test early exit
    // effectively: div(blacklisted) -> span(target). No 'A' found yet.

    // However, the loop continues until it finds 'A' or runs out of parents.
    // If it runs out of parents, handleLinkClick finishes without doing anything anyway.
    // To prove it exited *because* of blacklist, we should probably ensure that if it continued, it WOULD have found 'A'.
    target.append(blacklistedParent)
    // Structure: target(A) -> blacklistedParent -> span

    event.target = span
    event.composedPath = undefined // Force traversal loop

    handleLinkClick(event as unknown as MouseEvent, deps)

    expect(setLinkTargetToBlank).not.toHaveBeenCalled()
    expect(deps.shouldOpenInNewTab).not.toHaveBeenCalled()
  })

  it('should return early if modifier keys are pressed', () => {
    const modifiers = ['metaKey', 'ctrlKey', 'shiftKey', 'altKey']
    for (const key of modifiers) {
      const modifierEvent = {
        ...event,
        [key]: true,
      }
      // Simulate instanceof check (since we are passing a plain object, we need to trick it or use a real MouseEvent)
      // Since handleLinkClick checks `event instanceof MouseEvent`, we should use a real MouseEvent or mock the prototype if possible.
      // However, creating a real MouseEvent with read-only properties is tricky in some environments.
      // But in JSDOM (Vitest), we can pass options to MouseEvent constructor.

      const realEvent = new MouseEvent('click', {
        [key]: true,
        bubbles: true,
        cancelable: true,
      })
      // We need to attach properties that our test setup expects, like composedPath if we rely on it,
      // but here we want to fail EARLY.
      // The early return happens at the very beginning.

      handleLinkClick(realEvent, deps)

      // We can't easily spy on the return value of handleLinkClick because it returns void.
      // But we can check that NO side effects happened.
      expect(deps.shouldOpenInNewTab).not.toHaveBeenCalled()
    }
  })

  it('should stop propagation on specific sites when opening in current tab', () => {
    const depsZhihu = {
      ...deps,
      enableOpenInternalLinksInCurrentTab: true,
      hostname: 'www.zhihu.com',
    }
    vi.mocked(depsZhihu.shouldOpenInNewTab).mockReturnValue(false)
    vi.mocked(utils.getAttribute).mockReturnValue('_blank')
    target.href = 'https://www.zhihu.com/question/123'

    handleLinkClick(event as unknown as MouseEvent, depsZhihu)

    expect(event.stopImmediatePropagation).toHaveBeenCalled()
    expect(removeLinkTargetBlank).toHaveBeenCalledWith(target)
  })

  it('should not stop propagation on other sites when opening in current tab', () => {
    const depsOther = {
      ...deps,
      enableOpenInternalLinksInCurrentTab: true,
      hostname: 'www.example.com',
    }
    vi.mocked(depsOther.shouldOpenInNewTab).mockReturnValue(false)
    vi.mocked(utils.getAttribute).mockReturnValue('_blank')
    target.href = 'https://www.example.com/page'

    handleLinkClick(event as unknown as MouseEvent, depsOther)

    expect(event.stopImmediatePropagation).not.toHaveBeenCalled()
    expect(removeLinkTargetBlank).toHaveBeenCalledWith(target)
  })
})

describe('isBlacklisted', () => {
  it('should return true if element has blacklisted class', () => {
    const el = document.createElement('div')
    el.classList.add('bili-watch-later')
    expect(isBlacklisted(el)).toBe(true)
  })

  it('should return false if element does not have blacklisted class', () => {
    const el = document.createElement('div')
    expect(isBlacklisted(el)).toBe(false)
  })
})

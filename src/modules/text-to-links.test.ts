import * as utils from "browser-extension-utils"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  fixAnchorTag,
  isCodeViewer,
  replaceBBCodeImgLinks,
  replaceBBCodeLinks,
  replaceMarkdownImgLinks,
  replaceMarkdownLinks,
  replaceTextLinks,
  scanAndConvertChildNodes,
  textToLink,
} from "./text-to-links"

// Mock browser-extension-utils
vi.mock("browser-extension-utils", () => ({
  $: vi.fn(),
  $$: vi.fn().mockReturnValue([]),
  createElement: vi.fn((tag: string) => document.createElement(tag)),
  createHTML: vi.fn((html: string) => html),
  doc: document,
  hasClass: vi.fn(),
}))

describe("replaceMarkdownImgLinks", () => {
  it("should replace markdown image syntax with img tag", () => {
    const input = "![alt text](https://example.com/image.png)"
    const result = replaceMarkdownImgLinks(input)
    expect(result).toBe(
      '<img src="https://example.com/image.png" title="alt text" alt="alt text" role="img" style="max-width: 100% !important; vertical-align: bottom;" loading="lazy" referrerpolicy="no-referrer" rel="noreferrer" data-lh-status="1"/>'
    )
  })

  it("should handle empty alt text", () => {
    const input = "![](https://example.com/image.png)"
    const result = replaceMarkdownImgLinks(input)
    expect(result).toBe(
      '<img src="https://example.com/image.png" title="image" alt="image" role="img" style="max-width: 100% !important; vertical-align: bottom;" loading="lazy" referrerpolicy="no-referrer" rel="noreferrer" data-lh-status="1"/>'
    )
  })

  it("should not replace invalid markdown image syntax", () => {
    const input = "![alt text] (https://example.com/image.png)" // Space between ] and (
    // The regex allows spaces: `!\\[([^\\[\\]]*)\\]\\((?:\\s|<br/?>)*${urlPattern}(?:\\s|<br/?>)*\\)`
    // Wait, the regex is: `!\\[([^\\[\\]]*)\\]\\((?:\\s|<br/?>)*${urlPattern}(?:\\s|<br/?>)*\\)`
    // It does NOT have a space between `\\]` and `\\(`.
    // So "![alt text] (url)" should NOT be matched.
    const result = replaceMarkdownImgLinks(input)
    expect(result).not.toContain("<img")
    expect(result).toBe(input)
  })

  it("should return original text if no match", () => {
    const input = "Just text"
    expect(replaceMarkdownImgLinks(input)).toBe(input)
  })
})

describe("scanAndConvertChildNodes", () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement("div")
    document.body.append(container)
    vi.mocked(utils.hasClass).mockReset()
  })

  afterEach(() => {
    container.remove()
  })

  it("should ignore comment nodes", () => {
    container.innerHTML = "<!-- comment -->"
    const commentNode = container.firstChild as HTMLElement
    scanAndConvertChildNodes(commentNode)
    // No assertion needed as it should just return
    expect(commentNode.nodeType).toBe(8)
  })

  it("should ignore text nodes", () => {
    container.innerHTML = "Some text"
    const textNode = container.firstChild as HTMLElement
    scanAndConvertChildNodes(textNode)
    // No assertion needed as it should just return
    expect(textNode.nodeType).toBe(3)
  })

  it("should ignore ignored tags like TEXTAREA", () => {
    const textarea = document.createElement("textarea")
    textarea.textContent = "https://example.com"
    container.append(textarea)

    scanAndConvertChildNodes(textarea)

    expect(textarea.value).toBe("https://example.com")
  })

  it("should ignore code viewer elements", () => {
    const div = document.createElement("div")
    div.textContent = "https://example.com"
    // Mock isCodeViewer via hasClass since isCodeViewer calls it
    vi.mocked(utils.hasClass).mockImplementation(
      (el, cls) => cls === "diff-view"
    )

    scanAndConvertChildNodes(div)

    expect(div.innerHTML).toBe("https://example.com")
  })

  it("should call fixAnchorTag for A tags", () => {
    const a = document.createElement("a")
    a.href = "https://example.com)"
    a.textContent = "https://example.com)"
    container.append(a)

    scanAndConvertChildNodes(a)

    expect(a.textContent).toBe("https://example.com")
    expect(a.href).toBe("https://example.com/")
  })

  it("should convert text in normal elements", () => {
    const div = document.createElement("div")
    div.textContent = "Check this https://example.com"
    container.append(div)

    scanAndConvertChildNodes(div)

    expect(div.innerHTML).toContain(
      '<a href="https://example.com">https://example.com</a>'
    )
  })

  it("should recursively convert children", () => {
    const div = document.createElement("div")
    div.innerHTML = "<span>https://example.com</span>"
    container.append(div)

    scanAndConvertChildNodes(div)

    const span = div.querySelector("span")
    expect(span?.innerHTML).toContain(
      '<a href="https://example.com">https://example.com</a>'
    )
  })

  it("should handle BBCode split across BR tags", () => {
    const div = document.createElement("div")
    // [img]<br>url[/img]
    div.innerHTML = "[img]<br>https://example.com/image.png[/img]"
    container.append(div)

    scanAndConvertChildNodes(div)

    // The textToLink logic should handle the replacement on the parent (div)
    expect(div.innerHTML).toContain('<img src="https://example.com/image.png"')
  })

  it("should traverse Shadow DOM content", () => {
    const div = document.createElement("div")
    container.append(div)

    // Attach shadow root
    const shadowRoot = div.attachShadow({ mode: "open" })
    const shadowDiv = document.createElement("div")
    shadowDiv.textContent = "https://example.com"
    shadowRoot.append(shadowDiv)

    // Pass the host element (div) to scanAndConvertChildNodes
    scanAndConvertChildNodes(div)

    // Check if content inside Shadow DOM was converted
    expect(shadowDiv.innerHTML).toBe(
      '<span><a href="https://example.com">https://example.com</a></span>'
    )
  })

  it("should traverse nested Shadow DOM", () => {
    const div = document.createElement("div")
    container.append(div)

    const shadowRoot1 = div.attachShadow({ mode: "open" })
    const innerDiv = document.createElement("div")
    shadowRoot1.append(innerDiv)

    const shadowRoot2 = innerDiv.attachShadow({ mode: "open" })
    const contentDiv = document.createElement("div")
    contentDiv.textContent = "https://example.com"
    shadowRoot2.append(contentDiv)

    scanAndConvertChildNodes(div)

    expect(contentDiv.innerHTML).toBe(
      '<span><a href="https://example.com">https://example.com</a></span>'
    )
  })
})

describe("isCodeViewer", () => {
  let element: HTMLElement

  beforeEach(() => {
    element = document.createElement("div")
    vi.mocked(utils.hasClass).mockReset()
    vi.mocked(utils.$).mockReset()
  })

  it("should return true if element has class 'diff-view'", () => {
    vi.mocked(utils.hasClass).mockImplementation(
      (el, cls) => cls === "diff-view"
    )
    expect(isCodeViewer(element)).toBe(true)
  })

  it("should return true if element has class 'diff'", () => {
    vi.mocked(utils.hasClass).mockImplementation((el, cls) => cls === "diff")
    expect(isCodeViewer(element)).toBe(true)
  })

  it("should return true if element has class 'react-code-lines'", () => {
    vi.mocked(utils.hasClass).mockImplementation(
      (el, cls) => cls === "react-code-lines"
    )
    expect(isCodeViewer(element)).toBe(true)
  })

  it("should return true if element has class 'virtual-blame-wrapper'", () => {
    vi.mocked(utils.hasClass).mockImplementation(
      (el, cls) => cls === "virtual-blame-wrapper"
    )
    expect(isCodeViewer(element)).toBe(true)
  })

  it("should return true if element contains child with role='code'", () => {
    vi.mocked(utils.hasClass).mockReturnValue(false)
    vi.mocked(utils.$).mockReturnValue(document.createElement("div")) // Simulate finding an element
    expect(isCodeViewer(element)).toBe(true)
    expect(utils.$).toHaveBeenCalledWith('[role="code"]', element)
  })

  it("should return false if no conditions match", () => {
    vi.mocked(utils.hasClass).mockReturnValue(false)
    vi.mocked(utils.$).mockReturnValue(undefined)
    expect(isCodeViewer(element)).toBe(false)
  })
})

describe("replaceMarkdownLinks", () => {
  it("should replace markdown link syntax with a tag", () => {
    const input = "[link text](https://example.com)"
    const result = replaceMarkdownLinks(input)
    expect(result).toBe('<a href="https://example.com">link text</a>')
  })

  it("should remove trailing <br> from link text", () => {
    const input = "[link text<br>](https://example.com)"
    const result = replaceMarkdownLinks(input)
    expect(result).toBe('<a href="https://example.com">link text</a>')
  })

  it("should return original text if no match", () => {
    const input = "Just text"
    expect(replaceMarkdownLinks(input)).toBe(input)
  })
})

describe("replaceTextLinks", () => {
  it("should replace raw url with a tag", () => {
    const input = "https://example.com"
    const result = replaceTextLinks(input)
    expect(result).toBe('<a href="https://example.com">https://example.com</a>')
  })

  it("should return original text if no match", () => {
    const input = "Just text"
    expect(replaceTextLinks(input)).toBe(input)
  })
})

describe("replaceBBCodeImgLinks", () => {
  it("should replace bbcode img syntax with img tag", () => {
    const input = "[img]https://example.com/image.png[/img]"
    const result = replaceBBCodeImgLinks(input)
    expect(result).toBe(
      '<img src="https://example.com/image.png" title="https://example.com/image.png" alt="https://example.com/image.png" role="img" style="max-width: 100% !important; vertical-align: bottom;" loading="lazy" referrerpolicy="no-referrer" rel="noreferrer" data-lh-status="1"/>'
    )
  })

  it("should return original text if no match", () => {
    const input = "Just text"
    expect(replaceBBCodeImgLinks(input)).toBe(input)
  })
})

describe("replaceBBCodeLinks", () => {
  it("should replace bbcode url syntax with a tag", () => {
    const input = "[url]https://example.com[/url]"
    const result = replaceBBCodeLinks(input)
    expect(result).toBe('<a href="https://example.com">https://example.com</a>')
  })

  it("should replace bbcode url= syntax with a tag", () => {
    const input = "[url=https://example.com]link text[/url]"
    const result = replaceBBCodeLinks(input)
    expect(result).toBe('<a href="https://example.com">link text</a>')
  })

  it("should return original text if no match", () => {
    const input = "Just text"
    expect(replaceBBCodeLinks(input)).toBe(input)
  })
})

describe("textToLink", () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement("div")
    document.body.append(container)
  })

  afterEach(() => {
    container.remove()
    vi.clearAllMocks()
  })

  it("should return undefined if parent node is missing", () => {
    const textNode = document.createTextNode("https://example.com")
    // Detached node has no parent
    expect(textToLink(textNode as unknown as HTMLElement, "")).toBeUndefined()
  })

  it("should return undefined if node is not a text node", () => {
    const element = document.createElement("div")
    container.append(element)
    expect(textToLink(element, "")).toBeUndefined()
  })

  it("should return undefined if text content is empty", () => {
    const textNode = document.createTextNode("   ")
    container.append(textNode)
    expect(textToLink(textNode as unknown as HTMLElement, "")).toBeUndefined()
  })

  it("should return undefined if merged text length is less than 3", () => {
    const textNode = document.createTextNode("hi")
    container.append(textNode)
    expect(textToLink(textNode as unknown as HTMLElement, "")).toBeUndefined()
  })

  it("should convert raw URL to link", () => {
    const url = "https://example.com"
    const textNode = document.createTextNode(url)
    container.append(textNode)

    const result = textToLink(textNode as unknown as HTMLElement, "")

    expect(result).toBe(true)
    const span = container.querySelector("span")
    expect(span).not.toBeNull()
    expect(span?.innerHTML).toBe(`<a href="${url}">${url}</a>`)
  })

  it("should convert Markdown link to HTML link", () => {
    const text = "[Example](https://example.com)"
    const textNode = document.createTextNode(text)
    container.append(textNode)

    const result = textToLink(textNode as unknown as HTMLElement, "")

    expect(result).toBe(true)
    const span = container.querySelector("span")
    expect(span).not.toBeNull()
    expect(span?.innerHTML).toBe(`<a href="https://example.com">Example</a>`)
  })

  it("should convert Markdown image to HTML image", () => {
    const text = "![Image](https://example.com/image.png)"
    const textNode = document.createTextNode(text)
    container.append(textNode)

    const result = textToLink(textNode as unknown as HTMLElement, "")

    expect(result).toBe(true)
    const span = container.querySelector("span")
    expect(span).not.toBeNull()
    expect(span?.innerHTML).toBe(
      '<img src="https://example.com/image.png" title="Image" alt="Image" role="img" style="max-width: 100% !important; vertical-align: bottom;" loading="lazy" referrerpolicy="no-referrer" rel="noreferrer" data-lh-status="1">'
    )
  })

  it("should convert BBCode [url] to HTML link", () => {
    const text = "[url]https://example.com[/url]"
    const textNode = document.createTextNode(text)
    container.append(textNode)

    const result = textToLink(textNode as unknown as HTMLElement, "")

    expect(result).toBe(true)
    const span = container.querySelector("span")
    expect(span).not.toBeNull()
    expect(span?.innerHTML).toBe(
      `<a href="https://example.com">https://example.com</a>`
    )
  })

  it("should convert BBCode [url=...] to HTML link", () => {
    const text = "[url=https://example.com]Example[/url]"
    const textNode = document.createTextNode(text)
    container.append(textNode)

    const result = textToLink(textNode as unknown as HTMLElement, "")

    expect(result).toBe(true)
    const span = container.querySelector("span")
    expect(span).not.toBeNull()
    expect(span?.innerHTML).toBe(`<a href="https://example.com">Example</a>`)
  })

  it("should convert BBCode [img] to HTML image", () => {
    const text = "[img]https://example.com/image.png[/img]"
    const textNode = document.createTextNode(text)
    container.append(textNode)

    const result = textToLink(textNode as unknown as HTMLElement, "")

    expect(result).toBe(true)
    const span = container.querySelector("span")
    expect(span).not.toBeNull()
    expect(span?.innerHTML).toBe(
      '<img src="https://example.com/image.png" title="https://example.com/image.png" alt="https://example.com/image.png" role="img" style="max-width: 100% !important; vertical-align: bottom;" loading="lazy" referrerpolicy="no-referrer" rel="noreferrer" data-lh-status="1">'
    )
  })

  it("should handle mixed content", () => {
    const text = "Check this [link](https://example.com) out."
    const textNode = document.createTextNode(text)
    container.append(textNode)

    const result = textToLink(textNode as unknown as HTMLElement, "")

    expect(result).toBe(true)
    const span = container.querySelector("span")
    expect(span).not.toBeNull()
    expect(span?.innerHTML).toBe(
      'Check this <a href="https://example.com">link</a> out.'
    )
  })

  it("should not modify text if no links found", () => {
    const text = "Just some random text."
    const textNode = document.createTextNode(text)
    container.append(textNode)

    const result = textToLink(textNode as unknown as HTMLElement, "")
    expect(result).toBeUndefined()
    expect(container.innerHTML).toBe("Just some random text.")
  })
})

describe("complex markdown structures", () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement("div")
    document.body.append(container)
    vi.mocked(utils.$$).mockReturnValue([])
  })

  afterEach(() => {
    container.remove()
    vi.clearAllMocks()
  })

  it("should handle markdown link where URL is already parsed as an anchor tag", () => {
    // Structure: [Example](<a href="...">...</a>)
    container.innerHTML =
      '[Example](<a href="https://example.com">https://example.com</a>)'
    const textNode = container.firstChild!

    // textToLink is called on the text node "[Example]("
    // But we need to make sure the function logic uses parentNode.innerHTML which we set above.
    // And parentNode.textContent will be "[Example](https://example.com)" (browsers concatenate text of children)

    const result = textToLink(textNode as unknown as HTMLElement, "")

    expect(result).toBe(true)
    // Expect: <a href="https://example.com">Example</a>
    expect(container.innerHTML).toBe(
      '<a href="https://example.com">Example</a>'
    )
  })

  it("should handle markdown image where URL is already parsed as an img tag", () => {
    // Structure: ![Image](<img src="...">)
    container.innerHTML = '![Image](<img src="https://example.com/image.png">)'
    const textNode = container.firstChild!

    // We need to mock $$ to find the img tag because parentTextContent might be "![Image]()" which doesn't match link regex
    vi.mocked(utils.$$).mockImplementation((selector, root) => {
      if (selector === "img" && root === container) {
        return [container.querySelector("img")] as unknown as HTMLElement[]
      }

      return []
    })

    const result = textToLink(textNode as unknown as HTMLElement, "")

    expect(result).toBe(true)
    expect(container.innerHTML).toBe(
      '<img src="https://example.com/image.png" title="Image" alt="Image" role="img" style="max-width: 100% !important; vertical-align: bottom;" loading="lazy" referrerpolicy="no-referrer" rel="noreferrer" data-lh-status="1">'
    )
  })

  it("should handle markdown image where URL is parsed as anchor containing img", () => {
    // Structure: ![Image](<a href...><img src="..."></a>)
    container.innerHTML =
      '![Image](<a href="https://example.com/image.png"><img src="https://example.com/image.png"></a>)'
    const textNode = container.firstChild!

    vi.mocked(utils.$$).mockImplementation((selector, root) => {
      if (selector === "img" && root === container) {
        return [container.querySelector("img")] as unknown as HTMLElement[]
      }

      return []
    })

    const result = textToLink(textNode as unknown as HTMLElement, "")

    expect(result).toBe(true)
    expect(container.innerHTML).toBe(
      '<img src="https://example.com/image.png" title="Image" alt="Image" role="img" style="max-width: 100% !important; vertical-align: bottom;" loading="lazy" referrerpolicy="no-referrer" rel="noreferrer" data-lh-status="1">'
    )
  })

  it("should handle markdown link with trailing breaks inside parens", () => {
    // Structure: [Text](<a...>...</a><br>)
    container.innerHTML =
      '[Text](<a href="https://example.com">https://example.com</a><br>)'
    const textNode = container.firstChild!

    const result = textToLink(textNode as unknown as HTMLElement, "")

    expect(result).toBe(true)
    expect(container.innerHTML).toBe('<a href="https://example.com">Text</a>')
  })
})

describe("complex BBCode structures", () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement("div")
    document.body.append(container)
  })

  afterEach(() => {
    container.remove()
    vi.clearAllMocks()
  })

  it("should handle BBCode img where URL is already parsed as an img tag", () => {
    // Structure: [img]<img src="...">[/img]
    container.innerHTML = '[img]<img src="https://example.com/image.png">[/img]'
    const textNode = container.firstChild!

    const result = textToLink(textNode as unknown as HTMLElement, "")

    expect(result).toBe(true)
    expect(container.innerHTML).toBe(
      '<img src="https://example.com/image.png" title="https://example.com/image.png" alt="https://example.com/image.png" role="img" style="max-width: 100% !important; vertical-align: bottom;" loading="lazy" referrerpolicy="no-referrer" rel="noreferrer" data-lh-status="1">'
    )
  })

  it("should handle BBCode img where URL is parsed as anchor containing img", () => {
    // Structure: [img]<a href...><img src="..."></a>[/img]
    container.innerHTML =
      '[img]<a href="https://example.com/image.png"><img src="https://example.com/image.png"></a>[/img]'
    const textNode = container.firstChild!

    const result = textToLink(textNode as unknown as HTMLElement, "")

    expect(result).toBe(true)
    expect(container.innerHTML).toBe(
      '<img src="https://example.com/image.png" title="https://example.com/image.png" alt="https://example.com/image.png" role="img" style="max-width: 100% !important; vertical-align: bottom;" loading="lazy" referrerpolicy="no-referrer" rel="noreferrer" data-lh-status="1">'
    )
  })

  it("should handle BBCode url where URL is already parsed as an anchor tag", () => {
    // Structure: [url]<a href="...">...</a>[/url]
    container.innerHTML =
      '[url]<a href="https://example.com">https://example.com</a>[/url]'
    const textNode = container.firstChild!

    const result = textToLink(textNode as unknown as HTMLElement, "")

    expect(result).toBe(true)
    expect(container.innerHTML).toBe(
      '<a href="https://example.com">https://example.com</a>'
    )
  })

  it("should handle BBCode url= where URL is already parsed as an anchor tag", () => {
    // Structure: [url=<a href="...">...</a>]text[/url]
    container.innerHTML =
      '[url=<a href="https://example.com">https://example.com</a>]Link Text[/url]'
    const textNode = container.firstChild!

    const result = textToLink(textNode as unknown as HTMLElement, "")

    expect(result).toBe(true)
    expect(container.innerHTML).toBe(
      '<a href="https://example.com">Link Text</a>'
    )
  })

  it("should handle multiple mixed BBCode structures", () => {
    container.innerHTML =
      '[url]<a href="https://example.com">https://example.com</a>[/url] and [img]<img src="https://example.com/image.png">[/img]'
    const textNode = container.firstChild!

    const result = textToLink(textNode as unknown as HTMLElement, "")

    expect(result).toBe(true)
    expect(container.innerHTML).toBe(
      '<a href="https://example.com">https://example.com</a> and <img src="https://example.com/image.png" title="https://example.com/image.png" alt="https://example.com/image.png" role="img" style="max-width: 100% !important; vertical-align: bottom;" loading="lazy" referrerpolicy="no-referrer" rel="noreferrer" data-lh-status="1">'
    )
  })
})

describe("fixAnchorTag", () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement("div")
    document.body.append(container)
  })

  afterEach(() => {
    container.remove()
  })

  it("should fix anchor tag with trailing parenthesis in href and text", () => {
    container.innerHTML =
      '<a href="https://example.com)">https://example.com)</a>'
    const anchor = container.querySelector("a")!

    fixAnchorTag(anchor)

    expect(anchor.href).toBe("https://example.com/")
    expect(anchor.textContent).toBe("https://example.com")
    expect(anchor.nextSibling?.textContent).toBe(")")
  })

  it("should append trailing parenthesis to existing text sibling", () => {
    container.innerHTML =
      '<a href="https://example.com)">https://example.com)</a> existing text'
    const anchor = container.querySelector("a")!

    fixAnchorTag(anchor)

    expect(anchor.href).toBe("https://example.com/")
    expect(anchor.textContent).toBe("https://example.com")
    expect(anchor.nextSibling?.textContent).toBe(") existing text")
  })

  it("should not modify anchor tag without trailing parenthesis", () => {
    container.innerHTML =
      '<a href="https://example.com">https://example.com</a>'
    const anchor = container.querySelector("a")!
    const originalHref = anchor.href
    const originalText = anchor.textContent

    fixAnchorTag(anchor)

    expect(anchor.href).toBe(originalHref)
    expect(anchor.textContent).toBe(originalText)
    expect(anchor.nextSibling).toBeNull()
  })

  it("should not modify anchor tag if only href has parenthesis", () => {
    container.innerHTML = '<a href="https://example.com)">Link Text</a>'
    const anchor = container.querySelector("a")!
    const originalHref = anchor.href

    fixAnchorTag(anchor)

    expect(anchor.href).toBe(originalHref)
    expect(anchor.textContent).toBe("Link Text")
  })

  it("should not modify anchor tag if it has child elements", () => {
    container.innerHTML =
      '<a href="https://example.com)"><span>https://example.com)</span></a>'
    const anchor = container.querySelector("a")!
    const originalHref = anchor.href

    fixAnchorTag(anchor)

    expect(anchor.href).toBe(originalHref)
    expect(anchor.innerHTML).toBe("<span>https://example.com)</span>")
  })

  it("should handle multiple parentheses correctly (remove from first occurrence)", () => {
    container.innerHTML =
      '<a href="https://example.com))">https://example.com))</a>'
    const anchor = container.querySelector("a")!

    fixAnchorTag(anchor)

    expect(anchor.href).toBe("https://example.com/")
    expect(anchor.textContent).toBe("https://example.com")
    expect(anchor.nextSibling?.textContent).toBe("))")
  })
})

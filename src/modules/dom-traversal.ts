export function* getAllAnchors(
  root: Document | ShadowRoot | Element = document
): Generator<HTMLAnchorElement> {
  const elements = root.querySelectorAll('a')
  for (const element of elements) {
    yield element
  }

  const allElements = root.querySelectorAll('*')
  for (const element of allElements) {
    if (element.shadowRoot) {
      yield* getAllAnchors(element.shadowRoot)
    }
  }
}

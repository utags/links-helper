const base = location.origin

export const extractCanonicalId = (href: string): string | undefined => {
  try {
    const u = new URL(href, base)
    const p = u.pathname.toLowerCase()

    // Discourse, V2EX
    let m = /^(\/t\/\d+)(?:\/|$)/.exec(p)
    if (m) return m[1]

    // Discourse
    m = /^(\/t\/[^/]+\/\d+)(?:\/|$)/.exec(p)
    if (m) return m[1]

    // Flarum
    m = /^(\/d\/\d+(?:-[^/]+)?)(?:\/|$)/.exec(p)
    if (m) return m[1]
  } catch {}

  return undefined
}

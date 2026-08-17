import { apiEndpoints } from '../site.config'

/**
 * @returns {Promise<{ ok: boolean, policies?: Array<{id:string,title:string,slug:string,route:string}>, error?: string }>}
 */
export async function fetchPolicyList() {
  const res = await fetch(`${apiEndpoints.publicPolicy}?list=1`)
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.ok) {
    return { ok: false, error: data.error || 'Could not load policies.' }
  }
  return { ok: true, policies: Array.isArray(data.policies) ? data.policies : [] }
}

/**
 * @param {string} slug
 * @returns {Promise<{ ok: boolean, title?: string, slug?: string, markdown?: string, error?: string, code?: string }>}
 */
export async function fetchPolicyBySlug(slug) {
  const res = await fetch(`${apiEndpoints.publicPolicy}?slug=${encodeURIComponent(slug)}`)
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.ok) {
    return {
      ok: false,
      code: data.code,
      error: data.error || 'Could not load this policy.',
    }
  }
  return {
    ok: true,
    title: data.title,
    slug: data.slug,
    markdown: data.markdown,
    route: data.route,
  }
}

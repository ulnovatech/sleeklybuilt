/** Mutable bridge so api.js can attach Clerk JWTs without importing React. */
let tokenGetter = null

export function setClerkTokenGetter(getter) {
  tokenGetter = typeof getter === 'function' ? getter : null
}

export async function getClerkBearerToken() {
  if (!tokenGetter) return null
  try {
    const token = await tokenGetter()
    return token || null
  } catch {
    return null
  }
}

export function isClerkConfigured() {
  return Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)
}

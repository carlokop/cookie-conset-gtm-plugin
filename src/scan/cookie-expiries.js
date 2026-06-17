/**
 * @returns {Promise<Map<string, number | null>>}
 */
export async function collectCookieExpiries() {
  /** @type {Map<string, number | null>} */
  const expiries = new Map();

  if (typeof cookieStore === 'undefined' || typeof cookieStore.getAll !== 'function') {
    return expiries;
  }

  try {
    const cookies = await cookieStore.getAll();
    for (const cookie of cookies) {
      expiries.set(cookie.name, cookie.expires ?? null);
    }
  } catch {
    return expiries;
  }

  return expiries;
}

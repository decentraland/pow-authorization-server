import * as cookie from 'cookie'

export function getCookieHeader(signedJWT: string) {
  // TODO: Check if needs a *1000
  return { 'Set-Cookie': cookie.serialize('JWT', signedJWT, { expires: new Date(Date.now() + 7 * 24 * 3600) }) }
}

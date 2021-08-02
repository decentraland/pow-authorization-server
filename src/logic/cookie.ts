import * as cookie from 'cookie'

export function getCookieHeader(signedJWT: string) {
  return {
    'Set-Cookie': cookie.serialize('JWT', signedJWT, {
      expires: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      path: '/',
      sameSite: 'none',
      secure: true
    })
  }
}

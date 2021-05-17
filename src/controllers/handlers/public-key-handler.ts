import { AppComponents } from '../../types'

// handlers arguments only type what they need, to make unit testing easier
export type PublicKeyComponents = Pick<AppComponents, 'metrics'>

export async function publicKeyHandler(context: { url: URL; components: PublicKeyComponents }) {
  const {
    url,
    components: { metrics }
  } = context

  metrics.increment('public_key_counter', {
    pathname: url.pathname
  })

  return {
    body: { publicKey: 'key' }
  }
}

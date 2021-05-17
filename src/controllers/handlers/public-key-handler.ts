import { AppComponents } from '../../types'

// handlers arguments only type what they need, to make unit testing easier
export type PublicKeyComponents = Pick<AppComponents, 'metrics' | 'keys'>

export async function publicKeyHandler(context: { url: URL; components: PublicKeyComponents }) {
  const {
    url,
    components: { metrics, keys }
  } = context

  metrics.increment('total_request', {
    pathname: url.pathname
  })

  return {
    body: { publicKey: keys.publicKey }
  }
}

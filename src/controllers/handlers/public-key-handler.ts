import { IHttpServerComponent } from '@well-known-components/interfaces'
import { AppComponents } from '../../types'

export type PublicKeyComponents = Pick<AppComponents, 'metrics' | 'keys'>
export async function publicKeyHandler(context: {
  url: URL
  components: PublicKeyComponents
}): Promise<IHttpServerComponent.IResponse> {
  const {
    url,
    components: { metrics, keys }
  } = context

  metrics.increment('total_request', {
    pathname: url.pathname
    // method: context.request.method // TODO: fix this
  })

  return {
    body: { publicKey: keys.publicKey }
  }
}

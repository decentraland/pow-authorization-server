import { IHttpServerComponent } from '@well-known-components/interfaces'
import { AppComponents } from '../../types'

export type PublicKeyComponents = Pick<AppComponents, 'keys'>
export async function publicKeyHandler(context: {
  components: PublicKeyComponents
}): Promise<IHttpServerComponent.IResponse> {
  const {
    components: { keys }
  } = context

  return {
    body: { publicKey: keys.publicKey },
    status: 200
  }
}

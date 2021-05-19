import { IHttpServerComponent } from '@well-known-components/interfaces'
import { generateChallenge, isValidChallenge, SolvedChallenge } from '../../logic/challenge'
import { getCookieHeader } from '../../logic/cookie'
import { signJWT } from '../../logic/jwt'
import { AppComponents, GlobalContext } from '../../types'

export type VerifyChallengeComponents = Pick<AppComponents, 'metrics' | 'keys'>
export async function verifyChallengeHandler(
  context: IHttpServerComponent.DefaultContext<GlobalContext>
): Promise<IHttpServerComponent.IResponse> {
  const { url } = context

  context.components.metrics.increment('total_request', {
    pathname: url.pathname,
    method: context.request.method
  })

  const toValidate: SolvedChallenge = await context.request.clone().json()

  // validate
  const isValid = await isValidChallenge(toValidate, {
    // TODO: Read them from memory
    challenge: toValidate.challenge,
    complexity: toValidate.complexity
  })

  if (!isValid) {
    return { status: 401, body: 'Invalid Challenge' }
  }

  // generate JWT
  const signedJWT = signJWT(toValidate, context.components.keys.privateKey)

  return {
    body: {
      jwt: signedJWT
    },
    headers: { ...getCookieHeader(signedJWT) } // set cookie
  }
}

export type ObtainChallengeComponents = Pick<AppComponents, 'metrics'>
export async function obtainChallengeHandler(context: {
  url: URL
  components: ObtainChallengeComponents
}): Promise<IHttpServerComponent.IResponse> {
  const {
    url,
    components: { metrics }
  } = context

  metrics.increment('total_request', {
    pathname: url.pathname
    // method: context.request.method // TODO: fix this
  })

  return {
    body: generateChallenge()
  }
}

import { IHttpServerComponent } from '@well-known-components/interfaces'
import * as cookie from 'cookie'
import * as jwt from 'jsonwebtoken'
import { generateChallenge, isValidChallenge, SolvedChallenge } from '../../logic/challenge'
import { AppComponents, GlobalContext } from '../../types'

// handlers arguments only type what they need, to make unit testing easier
export type VerifyChallengeComponents = Pick<AppComponents, 'metrics' | 'keys'>
export function verifyChallengeHandler(
  components: VerifyChallengeComponents
): IHttpServerComponent.IRequestHandler<GlobalContext> {
  return async (context) => {
    const { url } = context

    components.metrics.increment('total_request', {
      pathname: url.pathname,
      method: context.request.method
    })

    const toValidate: SolvedChallenge = await context.request.clone().json()

    // validate
    const isValid = isValidChallenge(toValidate, {
      challenge: toValidate.challenge,
      complexity: toValidate.complexity
    })
    if (!isValid) {
      return { status: 401 }
    }

    // generate JWT
    const signedJWT = jwt.sign(
      {
        nonce: toValidate.nonce,
        challenge: toValidate.challenge,
        complexity: toValidate.complexity
      },
      components.keys.privateKey,
      { algorithm: 'RS256', expiresIn: '7d' }
    )
    // set cookie

    return {
      body: {
        jwt: signedJWT
      },
      headers: { 'Set-Cookie': cookie.serialize('JWT', signedJWT, { expires: new Date(Date.now() + 7 * 24 * 3600) }) }
    }
  }
}

// handlers arguments only type what they need, to make unit testing easier
export type ObtainChallengeComponents = Pick<AppComponents, 'metrics'>
export async function obtainChallengeHandler(context: {
  url: URL
  components: ObtainChallengeComponents
}): Promise<IHttpServerComponent.IRequestHandler<GlobalContext>> {
  const {
    url,
    components: { metrics }
  } = context

  metrics.increment('total_request', {
    pathname: url.pathname,
    method: 'GET'
  })

  return {
    body: generateChallenge()
  }
}

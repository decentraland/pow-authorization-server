import { IHttpServerComponent } from '@well-known-components/interfaces'
import { SolvedChallenge } from '../../logic/challenge'
import { AppComponents, GlobalContext } from '../../types'

// handlers arguments only type what they need, to make unit testing easier
export type VerifyChallengeComponents = Pick<AppComponents, 'metrics'>
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

    // const isValid = isValidChallenge(toValidate, {
    //   challenge: toValidate.challenge,
    //   complexity: toValidate.complexity
    // })

    // set cookie

    return {
      body: {
        jwt: 'token'
      }
    }
  }
}

// handlers arguments only type what they need, to make unit testing easier
export type ObtainChallengeComponents = Pick<AppComponents, 'metrics'>
export async function obtainChallengeHandler(context: { url: URL; components: ObtainChallengeComponents }) {
  const {
    url,
    components: { metrics }
  } = context

  metrics.increment('total_request', {
    pathname: url.pathname,
    method: 'GET'
  })

  return {
    body: { complexity: 2, challenge: 'hash' }
  }
}

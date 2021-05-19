import { IHttpServerComponent } from '@well-known-components/interfaces'
import { Challenge, generateChallenge, isValidChallenge, SolvedChallenge } from '../../logic/challenge'
import { getCookieHeader } from '../../logic/cookie'
import { signJWT } from '../../logic/jwt'
import { AppComponents, GlobalContext } from '../../types'

export type VerifyChallengeComponents = Pick<AppComponents, 'keys'>
export async function verifyChallengeHandler(
  context: IHttpServerComponent.DefaultContext<GlobalContext>
): Promise<IHttpServerComponent.IResponse> {
  const toValidate: SolvedChallenge = await context.request.clone().json()

  // validate
  const isValid = await isValidChallenge(toValidate, {
    // TODO!: Read them from memory
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
    headers: { ...getCookieHeader(signedJWT) }, // set cookie
    status: 200
  }
}

export async function obtainChallengeHandler(): Promise<IHttpServerComponent.IResponse> {
  const challenge: Challenge = await generateChallenge()
  return {
    body: { ...challenge },
    status: 200
  }
}

import { IHttpServerComponent } from '@well-known-components/interfaces'
import {
  Challenge,
  generateChallenge,
  incompleteSolvedChallenge,
  isValidChallenge,
  SolvedChallenge
} from '../../logic/challenge'
import { getCookieHeader } from '../../logic/cookie'
import { signJWT } from '../../logic/jwt'
import { AppComponents, GlobalContext } from '../../types'

export async function obtainChallengeHandler(): Promise<IHttpServerComponent.IResponse> {
  const challenge: Challenge = await generateChallenge()
  return {
    body: { ...challenge },
    status: 200
  }
}

export type VerifyChallengeComponents = Pick<AppComponents, 'keys'>
export async function verifyChallengeHandler(
  context: IHttpServerComponent.DefaultContext<GlobalContext>
): Promise<IHttpServerComponent.IResponse> {
  let toValidate: SolvedChallenge | undefined = undefined

  try {
    toValidate = await context.request.clone().json()
  } catch {}

  if (toValidate === undefined || incompleteSolvedChallenge(toValidate)) {
    return { status: 400, body: 'Invalid Request, body must be present with challenge, nonce and complexity' }
  }

  const isValid = await isValidChallenge(toValidate, {
    // TODO!: Read them from memory
    challenge: toValidate.challenge,
    complexity: toValidate.complexity
  })

  if (!isValid) {
    return { status: 401, body: 'Invalid Challenge' }
  }

  const signedJWT = signJWT(toValidate, context.components.keys.privateKey, context.components.keys.passphrase)

  return {
    body: {
      jwt: signedJWT
    },
    headers: { ...getCookieHeader(signedJWT) },
    status: 200
  }
}

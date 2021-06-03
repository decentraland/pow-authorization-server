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
import { AppComponents, CacheRecordContent, GlobalContext } from '../../types'

export async function obtainChallengeHandler(
  context: IHttpServerComponent.DefaultContext<GlobalContext>
): Promise<IHttpServerComponent.IResponse> {
  const { cache, logs } = context.components

  let challenge: Challenge | null = null

  let tries = 0
  while (tries < 3) {
    challenge = await generateChallenge()

    try {
      cache.put(
        challenge.challenge,
        {
          complexity: challenge.complexity
        },
        '7d'
      )

      break
    } catch {}

    tries += 1
  }

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

  let currentChallenge: CacheRecordContent

  try {
    currentChallenge = context.components.cache.get(toValidate.challenge, false)
  } catch (err) {
    context.components.logs.getLogger('LOGGER').info(err)

    return { status: 401, body: 'Invalid Challenge' }
  }

  context.components.logs.getLogger('loh').info('currentChallenge ' + JSON.stringify(currentChallenge, null, 4))

  const isValid = await isValidChallenge(toValidate, {
    challenge: toValidate.challenge,
    complexity: currentChallenge.complexity
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

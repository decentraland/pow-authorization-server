import { IHttpServerComponent } from '@well-known-components/interfaces'
import {
  Challenge,
  generateChallenge,
  getChallengeComplexity,
  incompleteSolvedChallenge,
  isValidChallenge,
  matchesComplexity,
  SolvedChallenge
} from '../../logic/challenge'
import { getCookieHeader } from '../../logic/cookie'
import { signJWT } from '../../logic/jwt'
import { AppComponents, CacheRecordContent, GlobalContext } from '../../types'

export async function obtainChallengeHandler(
  context: IHttpServerComponent.DefaultContext<GlobalContext>
): Promise<IHttpServerComponent.IResponse> {
  const { solvedCache, unsolvedCache, complexityRanges } = context.components

  // The amount of "active" users is the number of challenges emitted in the last 30m (both the solved and unsolved challenges)
  const complexity = getChallengeComplexity(unsolvedCache.getKeyCount() + solvedCache.getKeyCount(), complexityRanges)

  let challenge: Challenge | null = null
  let tries = 0
  while (tries < 3) {
    const newChallenge = await generateChallenge(complexity)

    tries += 1

    if (unsolvedCache.isPresent(newChallenge.challenge) || solvedCache.isPresent(newChallenge.challenge)) {
      continue
    }

    challenge = newChallenge
    break
  }

  if (challenge == null) {
    return { status: 500, body: "Couldn't generate a valid challenge please try again" }
  }

  unsolvedCache.put(
    challenge.challenge,
    {
      complexity: challenge.complexity
    },
    '30m' // Allow 30m to solve the challenge
  )

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
  const { unsolvedCache, solvedCache } = context.components

  try {
    toValidate = await context.request.clone().json()
  } catch {}

  if (toValidate === undefined || incompleteSolvedChallenge(toValidate)) {
    return { status: 400, body: 'Invalid Request, body must be present with challenge, nonce and complexity' }
  }

  if (solvedCache.isPresent(toValidate.challenge)) {
    return { status: 400, body: 'Invalid Challenge, the challenge was already solved' }
  }

  if (!unsolvedCache.isPresent(toValidate.challenge)) {
    return { status: 400, body: 'Invalid Challenge' }
  }

  const currentChallenge: CacheRecordContent = unsolvedCache.get(toValidate.challenge, false) as Challenge

  const challengeToMatch = {
    challenge: toValidate.challenge,
    complexity: currentChallenge.complexity
  }

  if (!matchesComplexity(toValidate, challengeToMatch)) {
    return { status: 400, body: 'The complexity does not match the expected one' }
  }

  const isValid = await isValidChallenge(toValidate)

  if (!isValid) {
    return { status: 401, body: 'Invalid Challenge' }
  }

  unsolvedCache.del(toValidate.challenge)
  solvedCache.put(
    toValidate.challenge,
    {
      complexity: toValidate.complexity
    },
    '30m'
  )

  const signedJWT = signJWT(toValidate, context.components.keys.privateKey, context.components.keys.passphrase)

  return {
    body: {
      jwt: signedJWT
    },
    headers: { ...getCookieHeader(signedJWT) },
    status: 200
  }
}

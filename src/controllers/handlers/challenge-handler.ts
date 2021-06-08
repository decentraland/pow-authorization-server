import { IHttpServerComponent, ILoggerComponent } from '@well-known-components/interfaces'
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
import { InMemoryCache } from '../../ports/cache'
import {
  AppComponents,
  CacheRecordContent,
  COMPLEXITY_KEY,
  DEFAULT_MAX_COMPLEXITY_VARIABLE,
  DEFAULT_MIN_COMPLEXITY_VARIABLE,
  DEFAULT_MIN_USERS_VARIABLE,
  GlobalContext,
  RATIO_TO_INCREASE_COMPLEXITY_VARIABLE,
  USER_THRESHOLD_KEY
} from '../../types'

export async function obtainChallengeHandler(
  context: IHttpServerComponent.DefaultContext<GlobalContext>
): Promise<IHttpServerComponent.IResponse> {
  const { cache, logs, config } = context.components

  let challenge: Challenge | null = null

  const currentComplexity = cache.get(COMPLEXITY_KEY) as number

  const complexity = getChallengeComplexity(
    cache.getKeyCount(),
    cache.get(USER_THRESHOLD_KEY) as number,
    currentComplexity,
    (await config.getNumber(DEFAULT_MIN_COMPLEXITY_VARIABLE)) as number,
    (await config.getNumber(DEFAULT_MAX_COMPLEXITY_VARIABLE)) as number,
    (await config.getNumber(RATIO_TO_INCREASE_COMPLEXITY_VARIABLE)) as number
  )

  const minUsers = (await config.getNumber(DEFAULT_MIN_USERS_VARIABLE)) as number
  const logger = logs.getLogger('obtainChallengeHandler')

  updateCacheComplexity(currentComplexity, complexity, cache, minUsers, logger)

  let tries = 0
  while (tries < 3) {
    challenge = await generateChallenge(complexity)

    try {
      cache.put(
        challenge.challenge,
        {
          complexity: challenge.complexity
        },
        '7d'
      )

      break
    } catch {
      logs.getLogger('obtainChallengeHandler').info(`${challenge.challenge} key already exists`)
      challenge = null
    }

    tries += 1
  }

  if (challenge == null) {
    return { status: 500, body: "Couldn't generate a valid challenge please try again" }
  }

  return {
    body: { ...challenge },
    status: 200
  }
}

export type VerifyChallengeComponents = Pick<AppComponents, 'keys'>

function updateCacheComplexity(
  currentComplexity: number,
  newComplexity: number,
  cache: InMemoryCache<number | CacheRecordContent>,
  minUsers: number,
  logger: ILoggerComponent.ILogger
) {
  if (currentComplexity === newComplexity) {
    return
  }

  const newUserCount = Math.max(cache.getKeyCount(), minUsers)

  logger.info(`Changed complexity from ${currentComplexity} to ${newComplexity}`)
  logger.info(`Changed users from from ${cache.get(USER_THRESHOLD_KEY)} to ${newUserCount}`)
  cache.del(COMPLEXITY_KEY)
  cache.del(USER_THRESHOLD_KEY)
  cache.put(COMPLEXITY_KEY, newComplexity, '7d')
  cache.put(USER_THRESHOLD_KEY, newUserCount, '7d')
}

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
    currentChallenge = context.components.cache.get(toValidate.challenge, false) as Challenge
  } catch (err) {
    context.components.logs.getLogger('verifyChallengeHandler').info(err)

    return { status: 400, body: 'Invalid Challenge' }
  }

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

  const signedJWT = signJWT(toValidate, context.components.keys.privateKey, context.components.keys.passphrase)

  return {
    body: {
      jwt: signedJWT
    },
    headers: { ...getCookieHeader(signedJWT) },
    status: 200
  }
}

import * as crypto from 'crypto'

const DEFAULT_COMPLEXITY = 4
const DEFAULT_CHALLENGE_LENGTH = 256
const DEFAULT_HASHING_ALGORITHM = 'sha256'

export interface Challenge {
  challenge: string
  complexity: number
}

export type SolvedChallenge = Challenge & {
  nonce: string
}

export async function generateChallenge(complexity: number = DEFAULT_COMPLEXITY): Promise<Challenge> {
  return {
    complexity: complexity,
    challenge: crypto.randomBytes(DEFAULT_CHALLENGE_LENGTH).toString('hex')
  }
}

export async function isValidChallenge(solvedChallenge: SolvedChallenge): Promise<boolean> {
  const hash = hashPhrase(solvedChallenge.challenge + solvedChallenge.nonce)

  return hash.startsWith('0'.repeat(solvedChallenge.complexity))
}

export function matchesComplexity(solvedChallenge: SolvedChallenge, givenChallenge: Challenge) {
  return solvedChallenge.complexity === givenChallenge.complexity
}

function hashPhrase(phrase: string) {
  return crypto.createHash(DEFAULT_HASHING_ALGORITHM).update(phrase, 'hex').digest('hex')
}

export function incompleteSolvedChallenge(toValidate: Partial<SolvedChallenge>): boolean {
  return toValidate.challenge === undefined || toValidate.complexity === undefined || toValidate.nonce === undefined
}

/**
 * Returns the according challenge complexity based on the current users
 *
 * @param currentUserCount Amount of keys in the cache (each for every user connected)
 * @param previousUserThreshold The threshold is the number of users required to perform a complexity switch, in a order of magnitude base this would be 1, 10, 100, etc.
 * @param currentComplexity The current complexity used for challenges
 * @param minComplexity The minimum allowed complexity so that challenges aren't too trivial to solve for a browser
 * @param maxComplexity The maximum allowed complexity so that challenges aren't too difficult to solve for a browser
 * @returns the desirable complexity for a challenge
 */
export function getChallengeComplexity(
  currentUserCount: number,
  previousUserThreshold: number,
  currentComplexity: number,
  minComplexity: number,
  maxComplexity: number,
  ratioToModifyComplexity: number
): number {
  // The current user count is an order of magnitude greater than the threshold
  if (currentUserCount / previousUserThreshold > ratioToModifyComplexity) {
    return Math.min(maxComplexity, currentComplexity + 1)
  }

  // The current user count is an order of magnitude lower than the threshold
  if (previousUserThreshold / currentUserCount > ratioToModifyComplexity) {
    return Math.max(minComplexity, currentComplexity - 1)
  }

  return currentComplexity
}

export function getChallengeComplexity2(
  currentUserCount: number,
  complexityThresholdMap: Record<number, number>,
  minComplexity: number,
  maxComplexity: number
): number {
  const thresholds = Object.keys(complexityThresholdMap).map((threshold) => parseInt(threshold))

  const sortedThresholds = thresholds.sort((a, b) => b - a)
  const filteredThresholds = sortedThresholds.filter((x) => x < currentUserCount)

  if (filteredThresholds.length === 0) {
    return minComplexity
  }

  return Math.min(maxComplexity, complexityThresholdMap[filteredThresholds[0]])
}

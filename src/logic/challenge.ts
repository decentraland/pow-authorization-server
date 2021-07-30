import * as crypto from 'crypto'

const DEFAULT_CHALLENGE_LENGTH = 256
const DEFAULT_HASHING_ALGORITHM = 'sha256'

export interface Challenge {
  challenge: string
  complexity: number
}

export type SolvedChallenge = Challenge & {
  nonce: string
}

export async function generateChallenge(complexity: number): Promise<Challenge> {
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
  return crypto.createHash(DEFAULT_HASHING_ALGORITHM).update(phrase, 'utf8').digest('hex')
}

export function incompleteSolvedChallenge(toValidate: Partial<SolvedChallenge>): boolean {
  return toValidate.challenge === undefined || toValidate.complexity === undefined || toValidate.nonce === undefined
}

export function getChallengeComplexity(
  currentUserCount: number,
  complexityThresholdMap: Record<number, number>
): number {
  const thresholds = Object.keys(complexityThresholdMap).map((threshold) => parseInt(threshold))

  const sortedThresholds = thresholds.sort((a, b) => b - a)
  const filteredThresholds = sortedThresholds.filter((x) => x < currentUserCount)

  if (filteredThresholds.length === 0) {
    return complexityThresholdMap[sortedThresholds[sortedThresholds.length - 1]]
  }

  return complexityThresholdMap[filteredThresholds[0]]
}

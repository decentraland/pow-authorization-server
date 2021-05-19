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

export async function isValidChallenge(solvedChallenge: SolvedChallenge, givenChallenge: Challenge): Promise<boolean> {
  if (
    solvedChallenge.challenge !== givenChallenge.challenge ||
    solvedChallenge.complexity !== givenChallenge.complexity
  ) {
    return false
  }
  const hash = crypto
    .createHash(DEFAULT_HASHING_ALGORITHM)
    .update(givenChallenge.challenge + solvedChallenge.nonce, 'hex')
    .digest('hex') // hash the message

  return hash.startsWith('0'.repeat(givenChallenge.complexity))
}

export async function generateChallenge(): Promise<Challenge> {
  return { complexity: DEFAULT_COMPLEXITY, challenge: crypto.randomBytes(DEFAULT_CHALLENGE_LENGTH).toString('hex') }
}

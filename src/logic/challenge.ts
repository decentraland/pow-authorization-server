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

export async function generateChallenge(): Promise<Challenge> {
  return {
    complexity: DEFAULT_COMPLEXITY,
    challenge: crypto.randomBytes(DEFAULT_CHALLENGE_LENGTH).toString('hex')
  }
}

export async function isValidChallenge(solvedChallenge: SolvedChallenge, givenChallenge: Challenge): Promise<boolean> {
  if (notMatching(solvedChallenge, givenChallenge)) {
    return false
  }
  const hash = hashPhrase(givenChallenge.challenge + solvedChallenge.nonce)

  return hash.startsWith('0'.repeat(givenChallenge.complexity))
}

function notMatching(solvedChallenge: SolvedChallenge, givenChallenge: Challenge) {
  return (
    solvedChallenge.challenge !== givenChallenge.challenge || solvedChallenge.complexity !== givenChallenge.complexity
  )
}

function hashPhrase(phrase: string) {
  return crypto.createHash(DEFAULT_HASHING_ALGORITHM).update(phrase, 'hex').digest('hex')
}

import * as crypto from 'crypto'
import { Challenge, generateChallenge, isValidChallenge, SolvedChallenge } from '../../../src/logic/challenge'

describe('challenge tests', () => {
  describe('when the challenge is valid', () => {
    let challenge: string
    let complexity: number
    let solved: SolvedChallenge

    beforeAll(async () => {
      challenge = crypto.randomBytes(20).toString('hex')
      complexity = 3
      solved = await resolveChallenge({ challenge, complexity })
    })

    it('should return true', async () => {
      expect(await isValidChallenge(solved, { challenge, complexity })).toBe(true)
    })
  })

  describe('when the challenge is not valid', () => {
    let challenge: string
    let complexity: number
    let solved: SolvedChallenge
    describe('when the challenge is different', () => {
      beforeAll(async () => {
        challenge = crypto.randomBytes(20).toString('hex')
        complexity = 3
        solved = { challenge: 'random', complexity, nonce: 'solution' }
      })

      it('should return true', async () => {
        expect(await isValidChallenge(solved, { challenge, complexity })).toBe(false)
      })
    })

    describe('when the complexity is different', () => {
      beforeAll(async () => {
        challenge = crypto.randomBytes(20).toString('hex')
        complexity = 3
        solved = { challenge, complexity, nonce: 'solution' }
      })

      it('should return true', async () => {
        expect(await isValidChallenge(solved, { challenge, complexity: 2 })).toBe(false)
      })
    })
  })

  describe('generateChallenge', () => {
    it('should return a valid challenge', async () => {
      expect(await generateChallenge()).toEqual(
        expect.objectContaining({ complexity: expect.any(Number), challenge: expect.any(String) })
      )
    })
  })

  async function resolveChallenge(challenge: Challenge): Promise<SolvedChallenge> {
    while (true) {
      const nonce = crypto.randomBytes(256).toString('hex')
      const isValid = await isValidChallenge({ ...challenge, nonce }, challenge)
      if (isValid) {
        return { ...challenge, nonce }
      }
    }
  }
})

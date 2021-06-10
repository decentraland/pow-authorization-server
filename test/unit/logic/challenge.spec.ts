import * as crypto from 'crypto'
import {
  Challenge,
  generateChallenge,
  getChallengeComplexity,
  isValidChallenge,
  SolvedChallenge
} from '../../../src/logic/challenge'

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
      expect(await isValidChallenge(solved)).toBe(true)
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
        expect(await isValidChallenge(solved)).toBe(false)
      })
    })
  })

  describe('generateChallenge', () => {
    it('should return a valid challenge', async () => {
      expect(await generateChallenge(4)).toEqual(
        expect.objectContaining({ complexity: expect.any(Number), challenge: expect.any(String) })
      )
    })
  })

  describe('getChallengeComplexity', () => {
    const thresholds = {
      200: 4,
      600: 5,
      1200: 6,
      2000: 7
    }

    describe('when the current count is within a range', () => {
      let result: number

      beforeEach(() => {
        result = getChallengeComplexity(650, thresholds)
      })

      it('should return the lower bound of the range', () => {
        expect(result).toEqual(5)
      })
    })

    describe('when the current count is higher the last bound', () => {
      let result: number

      beforeEach(() => {
        result = getChallengeComplexity(2500, thresholds)
      })

      it('should return the lower bound of the range', () => {
        expect(result).toEqual(7)
      })
    })

    describe('when the current count is lower than the minimum of the first range', () => {
      let result: number

      beforeEach(() => {
        result = getChallengeComplexity(1, thresholds)
      })

      it('should return the lowest complexity', () => {
        expect(result).toEqual(4)
      })
    })
  })

  async function resolveChallenge(challenge: Challenge): Promise<SolvedChallenge> {
    while (true) {
      const nonce = crypto.randomBytes(256).toString('hex')
      const isValid = await isValidChallenge({ ...challenge, nonce })
      if (isValid) {
        return { ...challenge, nonce }
      }
    }
  }
})

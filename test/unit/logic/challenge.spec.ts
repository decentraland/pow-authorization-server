import * as crypto from 'crypto'
import {
  Challenge,
  generateChallenge,
  getChallengeComplexity,
  getChallengeComplexity2,
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
      expect(await generateChallenge()).toEqual(
        expect.objectContaining({ complexity: expect.any(Number), challenge: expect.any(String) })
      )
    })
  })

  describe('getChallengeComplexity', () => {
    describe('when the current count is a ratio times smaller than the threshold', () => {
      describe('and the new complexity is the same or greater than the minimum allowed', () => {
        let result: number
        const currentComplexity = 1000

        beforeEach(() => {
          result = getChallengeComplexity(1, 10, currentComplexity, 0, 100000, 5)
        })

        it('should decrease the complexity', () => {
          expect(result).toEqual(currentComplexity - 1)
        })
      })

      describe('and the new complexity is lower than the minimum allowed', () => {
        let result: number
        const currentComplexity = 1000

        beforeEach(() => {
          result = getChallengeComplexity(1, 10, currentComplexity, currentComplexity, 100000, 5)
        })

        it('should return the minimum complexity', () => {
          expect(result).toEqual(currentComplexity)
        })
      })
    })

    describe('and the current count is a ratio times greater than the threshold', () => {
      describe('and the new complexity is greater than the maximum allowed', () => {
        let result: number
        const currentComplexity = 1000

        beforeEach(() => {
          result = getChallengeComplexity(100, 10, currentComplexity, 0, currentComplexity, 5)
        })

        it('should return the max complexity', () => {
          expect(result).toEqual(currentComplexity)
        })
      })

      describe('and the new complexity is lower or the same than the maximum allowed', () => {
        let result: number
        const currentComplexity = 1000

        beforeEach(() => {
          result = getChallengeComplexity(100, 10, currentComplexity, 0, currentComplexity + 1, 5)
        })

        it('should increase the complexity', () => {
          expect(result).toEqual(currentComplexity + 1)
        })
      })
    })

    describe('when the current count is within the bounds of the ratio of the threshold', () => {
      let result: number
      const currentComplexity = 1000

      beforeEach(() => {
        result = getChallengeComplexity(10, 100, currentComplexity, 0, 100000, 10)
      })

      it('should return the same complexity', () => {
        expect(result).toEqual(currentComplexity)
      })
    })
  })

  describe('getChallengeComplexity2', () => {
    const thresholds = {
      200: 4,
      600: 5,
      1200: 6,
      2000: 7
    }

    describe('when the current count is within a range', () => {
      let result: number

      beforeEach(() => {
        result = getChallengeComplexity2(650, thresholds, 0, 1000)
      })

      it('should return the lower bound of the range', () => {
        expect(result).toEqual(5)
      })
    })

    describe('when the current count is lower than the minimum of the first range', () => {
      let result: number
      const minimum = 0

      beforeEach(() => {
        result = getChallengeComplexity2(1, thresholds, minimum, 1000)
      })

      it('should return the lower minimum', () => {
        expect(result).toEqual(minimum)
      })
    })

    describe('when the current count is higher than the maximum of the last range', () => {
      describe('and the highest complexity is higher than the maximum allowed', () => {
        let result: number
        const maximum = 6

        beforeEach(() => {
          result = getChallengeComplexity2(2500, thresholds, -1, maximum)
        })

        it('should return the maximum', () => {
          expect(result).toEqual(maximum)
        })
      })

      describe('and the highest complexity is the same or lower than the maximum allowed', () => {
        let result: number
        const maximum = 1000

        beforeEach(() => {
          result = getChallengeComplexity2(2500, thresholds, -1, maximum)
        })

        it('should return the maximum', () => {
          expect(result).toEqual(7)
        })
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

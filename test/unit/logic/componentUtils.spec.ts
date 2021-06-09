import { parseRangesVariables } from '../../../src/logic/componentsUtils'

describe('parseRangesVariables', () => {
  describe('when calling it with a string that includes 0 in the map', () => {
    it('should return a valid map', () => {
      expect(parseRangesVariables('0:1,100:2,200:3,450:4')).toEqual({ 0: 1, 100: 2, 200: 3, 450: 4 })
    })
  })

  describe("when calling it with a string that doesn't include 0 in the map", () => {
    it('should return a valid map', () => {
      expect(() => parseRangesVariables('100:2,200:3,450:4')).toThrowError('The ranges should include 0')
    })
  })
})

import * as fs from 'fs'
import { writeToFile } from '../../../src/ports/local_storage'

describe('Local Storage', () => {
  afterAll(() => {
    jest.resetAllMocks()
  })

  describe('writeToFile', () => {
    const path = 'etc/secrets'
    const filename = 'public_key.pem'
    let spy: jest.SpyInstance

    beforeAll(() => {
      spy = jest.spyOn(fs, 'writeFileSync')

      writeToFile(path, filename, 'text')
    })

    it('should call the cookies library with the expected parameters', () => {
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith('etc/secrets/public_key.pem', 'text')
    })
  })
})

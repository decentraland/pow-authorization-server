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
      spy = jest.spyOn(fs, 'writeFile')

      writeToFile(path, filename, 'text')
    })

    it('should call the cookies library with the expected parameters', () => {
      expect(spy.mock.calls).toEqual([['etc/secrets/public_key.pem', 'text', expect.anything()]])
    })
  })
})

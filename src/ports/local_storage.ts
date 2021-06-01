import * as fs from 'fs'

export function writeToFile(dir: string, filename: string, text: string): void {
  // Creates folder if doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  // Writes text to file
  fs.writeFile(`${dir}/${filename}`, text, (err) => {
    if (err) throw err
  })
}

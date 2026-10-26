import { packageDirectory } from './package-core.mjs'

try {
  if (process.argv.length !== 4) {
    throw new Error('Usage: node package.mjs <block-directory> <output.zip>')
  }

  const result = await packageDirectory(process.argv[2], process.argv[3])

  console.log(
    `Created and validated: ${result.path}\n${result.entries} entries, ${result.zipBytes} ZIP bytes, ${result.expandedBytes} expanded bytes`
  )
} catch (error) {
  console.error(`Package failed: ${error.message}`)
  process.exitCode = 1
}

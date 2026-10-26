import {
  limits,
  readFileBounded,
  validateArchive,
} from './archive-contract.mjs'

try {
  if (process.argv.length !== 3) {
    throw new Error('Usage: node validate.mjs <block.zip>')
  }

  const result = await validateArchive(
    await readFileBounded(process.argv[2], limits.zip)
  )

  console.log(
    `Valid package: ${result.manifest.name}\nEntrypoint: ${result.manifest.entrypoint}\n${result.entries} entries, ${result.zipBytes} ZIP bytes, ${result.expandedBytes} expanded bytes\nArchive checks passed; browser behavior is not checked.`
  )
} catch (error) {
  console.error(`Validation failed: ${error.message}`)
  process.exitCode = 1
}

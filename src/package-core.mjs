import yazl from 'yazl'
import { lstat, readdir, realpath, writeFile } from 'node:fs/promises'
import path from 'node:path'

import {
  assertFile,
  assertPath,
  limits,
  readBounded,
  readFileBounded,
  validateArchive,
} from './archive-contract.mjs'

export async function packageDirectory(input, output) {
  const root = await realpath(input)

  if (!(await lstat(root)).isDirectory()) {
    throw new Error('Input must be a directory')
  }

  const destination = path.join(
    await realpath(path.dirname(path.resolve(output))),
    path.basename(output)
  )

  const relative = path.relative(root, destination)

  if (
    !relative ||
    (!relative.startsWith(`..${path.sep}`) &&
      relative !== '..' &&
      !path.isAbsolute(relative))
  ) {
    throw new Error('Output ZIP must be outside the input directory')
  }

  if (path.extname(destination) !== '.zip') {
    throw new Error('Output filename must end in .zip')
  }

  const files = []
  const seen = new Set()

  let expanded = 0
  let entries = 0

  async function walk(directory, prefix = '') {
    const names = (await readdir(directory)).sort()

    for (const basename of names) {
      if (basename === '.DS_Store') {
        continue
      }

      const name = prefix + basename

      assertPath(name)

      if (++entries > limits.entries) {
        throw new Error('Input exceeds 100 entries, including directories')
      }

      if (seen.has(name.toLowerCase())) {
        throw new Error(`${name}: duplicate path (case insensitive)`)
      }

      seen.add(name.toLowerCase())

      const filename = path.join(directory, basename)
      const stat = await lstat(filename)

      if (stat.isDirectory()) {
        await walk(filename, `${name}/`)
      } else if (stat.isFile()) {
        assertFile(name)

        const limit = Math.min(
          name === 'manifest.json' ? limits.manifest : limits.file,
          limits.expanded - expanded
        )

        const data = await readFileBounded(filename, limit)

        expanded += data.length
        files.push({ name, data })
      } else {
        throw new Error(
          `${name}: only regular files and directories are supported`
        )
      }
    }
  }

  await walk(root)

  const zip = new yazl.ZipFile()

  zip.on('error', (error) => zip.outputStream.destroy(error))

  const pending = readBounded(zip.outputStream, limits.zip, 'ZIP')

  for (const { name, data } of files) {
    zip.addBuffer(data, name, {
      mtime: new Date(2000, 0, 1),
      mode: 0o100644,
      forceDosTimestamp: true,
    })
  }

  zip.end()

  const data = await pending
  const result = await validateArchive(data)

  // Never truncate a previous user artifact. Choose a new filename for revisions.
  await writeFile(destination, data, { flag: 'wx' })

  return { ...result, path: destination }
}

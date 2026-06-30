import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const legacyJsonPath = 'public/header-patch/assets/header-patch-selected-items.json'
const legacyJsonFile = 'header-patch-selected-items.json'
const runtimeRoots = [
  'app',
  'components',
  'composables',
  'layouts',
  'layers',
  'pages',
  'plugins',
  'server',
  'shared',
  'utils',
]
const sourceExtensions = new Set(['.js', '.mjs', '.ts', '.mts', '.vue'])
const repoRoot = process.cwd()
const hits: string[] = []

function hasSourceExtension(path: string): boolean {
  return [...sourceExtensions].some(extension => path.endsWith(extension))
}

function scanDirectory(directory: string): void {
  if (!existsSync(directory))
    return

  for (const entry of readdirSync(directory)) {
    const absolutePath = join(directory, entry)
    const relativePath = relative(repoRoot, absolutePath).replaceAll('\\', '/')
    const stats = statSync(absolutePath)

    if (stats.isDirectory()) {
      if (entry === 'node_modules' || entry === '.nuxt' || entry === '.output')
        continue

      scanDirectory(absolutePath)
      continue
    }

    if (!hasSourceExtension(relativePath))
      continue

    const contents = readFileSync(absolutePath, 'utf8')
    if (contents.includes(legacyJsonPath) || contents.includes(legacyJsonFile))
      hits.push(relativePath)
  }
}

for (const root of runtimeRoots)
  scanDirectory(join(repoRoot, root))

assert.deepEqual(
  hits,
  [],
  `Runtime code must not consume ${legacyJsonPath}; found references in: ${hits.join(', ')}`,
)

console.log('homepage legacy JSON runtime scan: ok')

// Package integrity helpers used by the live arena.
import {createHash} from 'node:crypto';
import {realpathSync,readdirSync,lstatSync,readFileSync} from 'node:fs';
import {join,relative,sep} from 'node:path';

function canonical(value) {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']'
  if (value !== null && typeof value === 'object') {
    return (
      '{' +
      Object.keys(value)
        .sort()
        .map((key) => JSON.stringify(key) + ':' + canonical(value[key]))
        .join(',') +
      '}'
    )
  }
  return JSON.stringify(value) ?? 'null'
}

export function capabilityHash(entry) {
  return createHash('sha256')
    .update(canonical({ contributions: entry.contributions ?? [], dependencies: entry.dependencies ?? {} }))
    .digest('hex')
}

export function hashDirectory(dir) {
  const root = realpathSync(dir)
  const files = []
  const walk = (current) => {
    for (const dirent of readdirSync(current, { withFileTypes: true })) {
      const file = join(current, dirent.name)
      const rel = relative(root, file).split(sep).join('/')
      const stat = lstatSync(file)
      if (stat.isSymbolicLink()) throw new Error('package tree contains a symbolic link: ' + rel)
      if (stat.isDirectory()) {
        walk(file)
        continue
      }
      if (stat.isFile() === false) throw new Error('package tree contains a special entry: ' + rel)
      files.push({ rel, file })
    }
  }
  walk(root)
  const outer = createHash('sha256')
  for (const { rel, file } of files.sort((left, right) => (left.rel < right.rel ? -1 : left.rel > right.rel ? 1 : 0))) {
    outer.update(createHash('sha256').update(rel).update('\0').update(readFileSync(file)).digest())
  }
  return 'sha256-' + outer.digest('hex')
}


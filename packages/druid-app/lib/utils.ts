import * as fs from 'fs'
import * as path from 'path'
import * as glob from 'fast-glob'

const appDirectory = fs.realpathSync(process.cwd())

export const resolveApp = relativePath => {
  return path
    .resolve(appDirectory, relativePath)
    .replace(/\\/g, '/')
}

export function importFile (rPath : string) {
  return require(resolveApp(rPath))
}

export function findFiles (pattern: string) {
  return glob.sync(pattern, { cwd: appDirectory })
}

export function getDirNameFromPath (filePath: string): string {
  const splitPath = filePath.split('/')
  return splitPath[splitPath.length - 2]
}

export function getNameFromPath (filePath: string): string {
  const splitPath = filePath.replace(/.(js|ts)/g, '').split('/')
  return splitPath[splitPath.length - 1]
}

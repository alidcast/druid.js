import * as fs from 'fs'
import * as path from 'path'
import * as glob from 'fast-glob'

const appDirectory = fs.realpathSync(process.cwd())

export const globOptions = { 
  recursive: true, cwd: appDirectory, root: resolveApp('./src') 
}

export function resolveApp(relativePath) {
  return path
    .resolve(appDirectory, relativePath)
    .replace(/\\/g, '/')
}

export function importFile (rPath : string) {
  return require(resolveApp(rPath))
}

export function findFiles (pattern: string) {
  return glob.sync(pattern, globOptions)
}

export function getDirNameFromPath (filePath: string): string {
  const splitPath = filePath.split('/')
  return splitPath[splitPath.length - 2]
}

export function getNameFromPath (filePath: string): string {
  const splitPath = filePath.replace(/.(js|ts)/g, '').split('/')
  return splitPath[splitPath.length - 1]
}

export function withPathsRelativeToSource(rawOptions) {
  const options = !!rawOptions ? JSON.parse(JSON.stringify(rawOptions)) : {}
  const srcDir = options.srcDir = resolveApp(rawOptions.srcDir)
  Object.keys(rawOptions.modulePaths).forEach(key => {
    options.modulePaths[key] = path.join(srcDir, rawOptions.modulePaths[key]).replace(/\\/g, '/')
  })
  return options 
}
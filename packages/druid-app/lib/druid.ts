import * as path from 'path'
import { resolveApp } from './utils'

import * as express from 'express'
import { ApolloServer } from 'apollo-server-express'
import initContext from './context'
import loadSchema from './loadSchema'

type AppOptions = {
  port?: number 
  path?: string
  appKey?: string
  srcDir?: string
  modulePaths?: any 
}

export const defaults = {
  port: 4000,
  path: '/graphql',
  appKey: null,
  srcDir: './src',
  modulePaths: {
    models: './entities/**/model.*(ts|js)',
    scalars: './entities/**/scalars.*(ts|js)',
    typeDefs: './entities/**/typeDefs.gql',
    resolvers: './entities/**/resolvers.*(ts|js)'
  }
}

export default class App {
  options: AppOptions 
  connection: any

  constructor (connection: Function, options: AppOptions = {}) {
    this.options = normalizeOptions(options)
    this.connection = connection
  }

  private create (customModules?: any) {
    const { connection, options } = this
    const schema = loadSchema(options)
    const context = (initialCtx) => initContext(initialCtx, connection, options, customModules)
    const server = new ApolloServer({ schema, context })

    const app = express()
    server.applyMiddleware({ app, path: options.path })
    return app
  }

  public listen (port: number, cb: Function) {
    const app = this.create()
    return app.listen(port, cb)
  }
}

export function normalizeOptions (options) {
  return withPathsRelativeToSource({ ...defaults, ...options })
}

export function withPathsRelativeToSource (rawOptions) {
  const options = !!rawOptions ? JSON.parse(JSON.stringify(rawOptions)) : {}
  const srcDir = options.srcDir = resolveApp(rawOptions.srcDir)
  Object.keys(rawOptions.modulePaths).forEach(key => {
    options.modulePaths[key] = path.join(srcDir, rawOptions.modulePaths[key]).replace(/\\/g, '/')
  })
  return options 
}
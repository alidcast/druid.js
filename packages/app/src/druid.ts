import * as express from 'express'
import { ApolloServer } from 'apollo-server-express'
import createContext from './context'
import loadSchema from './schema'
import { withPathsRelativeToSource } from '@druidjs/path-utils'

type AppOptions = {
  port?: number 
  path?: string
  srcDir?: string
  modulePaths?: any,
  context?: (ctx: any) => object
}

export const defaults = {
  path: '/graphql',
  srcDir: './src',
  modulePaths: {
    models: './entities/**/model.*(ts|js)',
    scalars: './entities/**/scalars.*(ts|js)',
    typeDefs: './entities/**/typeDefs.gql',
    resolvers: './entities/**/resolvers.*(ts|js)'
  }
}

export function normalizeOptions(options) {
  return withPathsRelativeToSource({ ...defaults, ...options })
}

export class Druid {
  options: AppOptions 
  instance: any 
  connection: any
  apolloServer: any

  constructor (connection: Function, options: AppOptions = {}) {
    this.options = normalizeOptions(options)
    this.instance = express()
    this.connection = connection
    this.apolloServer = null
  }

  initialize(context: Function = createContext) {
    const { connection, options } = this
    this.apolloServer = new ApolloServer({ 
      schema: loadSchema(options as any), 
      context: ({ req }) => ({
        req,
        ...(typeof options.context === 'function' ? options.context(req) : {}),
        ...(context({ req }, connection, options))
      })
    })
    this.apolloServer.applyMiddleware({ app: this.instance, path: options.path })
  }

  use(...args) {
    return this.instance.use(...args)
  }

  listen(port: number, cb: Function) {
    this.initialize()
    return this.instance.listen(port, cb)
  }
}

export default Druid
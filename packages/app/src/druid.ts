import * as express from 'express'
import { ApolloServer } from 'apollo-server-express'
import createContext from './context'
import loadSchema from './schema'
import { getAuthUser } from './context/auth'
import { withPathsRelativeToSource } from '@druidjs/path-utils'
// import https from 'https'
import * as http from 'http'

type AppOptions = {
  port?: number 
  path?: string
  srcDir?: string
  modulePaths?: any,
  context?: (ctx: any) => object
  apolloOptions?: any
}

export const defaults = {
  path: '/graphql',
  srcDir: './src',
  modulePaths: {
    models: './entities/*/model.*(ts|js)',
    scalars: './entities/*/scalars.*(ts|js)',
    typeDefs: './entities/*/typeDefs.gql',
    resolvers: './entities/*/resolvers.*(ts|js)'
  },
  apolloOptions: {
    introspection: process.env.NODE_ENV !== 'production',
    playground: process.env.NODE_ENV !== 'production',
  }
}

export function normalizeOptions(options) {
  return withPathsRelativeToSource({ ...defaults, ...options })
}

export class Druid {
  options: AppOptions 
  instance: any 
  connection: any
  // Expose apollo server for wrappers
  apolloServer: any

  constructor (connection: Function, options: AppOptions = {}) {
    this.options = normalizeOptions(options)
    this.connection = connection
    this.instance = express()
    this.apolloServer = null  
  }

  initialize(context: Function = createContext) {
    const { connection, options } = this

    const initializeContext = (req) => ({
      req, 
      ...(typeof options.context === 'function' ? options.context(req) : {}),
      ...(context({ req }, connection, options))
    })

    this.apolloServer = new ApolloServer({ 
      schema: loadSchema(options as any), 
      context: ({ req, connection: subscriptionConnection }: any) => {
        // If context params includes a connect subscription then we just relay its context back to apollo.
        // Well have a chance to initialize context in `onConnect` subscription handler below.
        if (subscriptionConnection) {
          return subscriptionConnection.context 
        }
        return initializeContext(req)
      },
      subscriptions: {
        onConnect: async (_, __, connectionContext) => {
          const { request: req } = connectionContext
          // Currently just authenticating user via jwt cookie sent from subscription client.
          // Might need to make this more robust if we start handling complex logic inside subscriptions.
          // Since right now subscription resolvers are getting same context as mutation resolvers.
          const [, token] = req.headers.cookie.split(';').find(c => c.trim().startsWith('jwt=')).split('=')
          const user = token && await getAuthUser(connection, token)
          if (!user) return false 

          return {}
        },
      },
      ...options.apolloOptions
    })
    this.apolloServer.applyMiddleware({ app: this.instance, path: options.path })
  }

  use(...args) {
    return this.instance.use(...args)
  }

  listen(port: number, cb: Function) {
    this.initialize()

    const server = http.createServer(this.instance)
    this.apolloServer.installSubscriptionHandlers(server)
    return server.listen(port, cb)
  }
}

export default Druid

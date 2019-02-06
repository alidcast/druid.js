import { createTestClient } from 'apollo-server-testing'
import { transaction } from 'objection'
import createContext from '@druidjs/app/dist/context'
import { initDb } from '@druidjs/app/dist/context/db'
import { generateToken } from '@druidjs/app/dist/context/auth'
import { resolveApp } from '@druidjs/path-utils'

export async function createTestServer() {
  const app = getDruidInstance()
  const trx = await transaction.start(app.connection)
  
  const mockCtx = { req: { headers: {} } }
  const createMockContext = (_, __, options) => createContext(mockCtx, trx, options)
  app.initialize(createMockContext)

  const { query, mutate } = createTestClient(app.apolloServer)

  const testServer = {
    db: initDb(trx, app.options),

    setHeaders(headers) {
      mockCtx.req.headers = headers
    },
    query,
    mutate,
    authQuery(userId: number, queryArgs) {
      testServer.setHeaders(getAuthHeader(userId))
      return query(queryArgs)
    },
    authMutate(userId: number, mutateArgs) {
      testServer.setHeaders(getAuthHeader(userId))
      return mutate(mutateArgs)
    },
    async cleanup() {
      testServer.setHeaders({})
      await trx.rollback()
    },
    async destroy() {
      await app.connection.destroy()
    }
  }

  return testServer
}


export function getAuthHeader(userId: number) {
  return {
    authorization: `Bearer ${generateToken(userId)}`
  }
}

function getDruidInstance ({ srcDir = './src' } = {}) {
  return require(resolveApp(`./${srcDir}/app`)).default 
}

import { normalizeOptions } from '@druidjs/app/dist/druid'
import initContext from '@druidjs/app/dist/context/'
import initDb from '@druidjs/app/dist/context/db'
import initProxyRequest from './proxyRequest'
import { transaction } from 'objection'
import { join } from 'path'

export class TestServer {
  db: any
  app: any
  request: Function

  private static async initProxyDb(connection, options) {
    const trx = await transaction.start(connection)
    // pass trx as database connection so that we can rollback all operations
    const db = initDb(trx, options) as any
    db._trx = trx
    db._conn = connection
    return db
  }

  public async init (userOptions = {}) {  
    const druid = getDruidInstance(userOptions)
    const db = this.db = await TestServer.initProxyDb(druid.connection, druid.options)
    const app = this.app = druid.create({ db })
    this.request = initProxyRequest(app)
  }

  public async rollback () {
    await this.db._trx.rollback()
  }

  public async destroy () {
    await this.db._conn.destroy()
  }
}

export default async function createTestServer (userOptions = {}) {
  const server = new TestServer() 
  await server.init(userOptions)
  return server 
}

function getDruidInstance (userOptions) {
  const options = normalizeOptions(userOptions)
  return require(join(options.srcDir, 'app')).default 
}
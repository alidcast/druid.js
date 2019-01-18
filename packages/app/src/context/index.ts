import { initAuth } from './auth'
import { initDb } from './db'

export default function createContext(ctx, connection, options) {
  const db = initDb(connection, options) 
  const auth = initAuth(ctx, db)
  return {
    db,
    auth
  }
}
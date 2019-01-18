import initAuth from './auth'
import initDb from './db'

type CustomModules = {
  db?: any
  auth?: any
}

export default function context ({ req }, connection, options, customModules: CustomModules = {}) {
  const db = customModules.db || initDb(connection, options) 
  const auth = customModules.auth || initAuth(req, options, db)
  
  return {
    req,
    db,
    auth
  }
}
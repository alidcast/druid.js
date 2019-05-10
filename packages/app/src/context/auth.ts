import * as jwt from 'jsonwebtoken'
import { AuthenticationError, ForbiddenError } from 'apollo-server'

function getAppKey() {
  return process.env.APP_KEY
}

export function initAuth({ req }, db) {
  const getUser = (fail = false) => getAuthUserFromReq(req, db, fail)

  return {
    getUser,
    getUserId: () => getUser().then(user => user.id),
    maybeGetUser: () => getUser(false),
    generateToken: generateToken
  }
}

export async function getAuthUserFromReq(req: any, db: any, shouldFail = true) {
  const { authorization } = req.headers
  const noAuthorization = !authorization || authorization.indexOf('Bearer') === -1

  if (noAuthorization && shouldFail) throw new AuthenticationError('You must supply a JWT for authorization!')
  else if (noAuthorization) return null 

  // cache user via req object in case there are repeat calls to $getUser
  if (req.user) return req.user 
  
  const token = authorization.replace('Bearer ', '')
  const user = await getAuthUser(db.$connection, token)
  req.user = user

  return req.user
}

export async function getAuthUser(connection: any, token: any) {
  let userId
  try {
    userId = jwt.verify(token, getAppKey()).userId
  } catch (err) {
    throw new ForbiddenError('You are not authorized.')
  }

  const user = await connection('users').where('id', userId).first()
  if (!user) throw new AuthenticationError('Encrypted user does not exist.')
  return user
}

export function generateToken (userId) {
  return jwt.sign({ userId }, getAppKey())
}

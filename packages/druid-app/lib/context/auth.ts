import * as jwt from 'jsonwebtoken'
import { AuthenticationError, ForbiddenError } from 'apollo-server'

const secretKey = (key = null) => key || process.env.APP_KEY

export default function initAuth (req, options, db) {
  const getUser = initGetAuthUser(req, options, db)

  return {
    getUser,
    getUserId: () => getUser().then(user => user.id),
    maybeGetUser: () => getUser(false),
    generateToken: generateToken
  }
}

export function initGetAuthUser (req, options, db) {
  return async function getAuthUser (shouldFail = true) {
    const { authorization } = req.headers
    const noAuthorization = !authorization || authorization.indexOf('Bearer') === -1
    if (noAuthorization && shouldFail) throw new AuthenticationError('You must supply a JWT for authorization!')
    else if (noAuthorization) return null 
    
    // cache user via req object in case there are repeat calls to $getUser
    if (req.user) return req.user 

    let userId
    try {
      const token = authorization.replace('Bearer ', '')
      userId = jwt.verify(token, secretKey(options.appKey)).userId
    } catch (err) {
      throw new ForbiddenError('You are not authorized.')
    }

    const user = await db.User.query().where('id', userId).first()
    if (!user) throw new AuthenticationError('Encrypted user does not exist.')
    req.user = user
    
    return req.user
  }
}

export function generateToken (userId) {
  return jwt.sign({ userId }, secretKey())
}

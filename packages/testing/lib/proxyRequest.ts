import * as supertest from 'supertest'
import { generateToken } from '@druidjs/app/dist/context/auth'

export type RequestData = {
  query?: string
  mutation?: string
  variables?: object
  headers?: object
}

const API_ENDPOINT = '/graphql'

export function withAuthHeader (userId: number, reqData: RequestData): RequestData {
  return {
    headers: { Authorization: `Bearer ${generateToken(userId)}` },
    ...reqData
  }
}

/*
* Proxy server for running graphql tests.
*/
export default function initProxyRequest (app) {
  const agent = supertest.agent(app)
  return async function request (
    { query, mutation, variables, headers = {} }: RequestData, returnBody: boolean = true
  ) {
    
    // Queries can be defined as strings or via gql tags, 
    // in the latter case we have to get the source from the query ast.
    let queryBody = (query || mutation) as any
    if (typeof queryBody !== 'string' && queryBody.loc) queryBody = queryBody.loc.source.body

    let request = agent
      .post(API_ENDPOINT)
      .set({ Accept: 'application/json', ...headers })
      .send({ query: queryBody, variables })
  
    if (returnBody) request = request.then(res => res.body)
  
    return request
  }
}
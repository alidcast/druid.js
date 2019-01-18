const { createTestServer, getAuthHeader } = require('./dist')

let server

function getTestServer () {
  return server 
}

beforeEach(async () => { 
  server = await createTestServer()
})

afterEach(async () => { 
  await server.cleanup()
})

afterAll(async () => { 
  await server.destroy() 
})

module.exports = {
  getTestServer,
  getAuthHeader
}
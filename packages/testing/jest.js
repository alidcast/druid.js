const { createTestServer, getAuthHeader } = require('./dist')

let server

function getTestServer () {
  return server 
}

beforeEach(async () => { 
  try {
    server = await createTestServer()
  } catch(err) {
    console.log(err)
  }
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
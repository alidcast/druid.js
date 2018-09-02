const { createTestServer, withAuthHeader } = require('./dist')

let server

beforeEach(async () => { 
  try {
    server = await createTestServer()
  } catch (err) {
    console.log(`Error starting server: ${err}`)
    process.exit()
  }
})

afterEach(async () => { 
  await server.rollback() 
})

afterAll(async () => { 
  await server.destroy() 
})

module.exports = {
  getTestServer () {
    return server 
  },
  withAuthHeader
}
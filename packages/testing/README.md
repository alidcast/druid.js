# druidjs/testing

- [Testing Setup](#app-setup)
- [Graphql Testing](#app-setup)

## App Setup

First, install Druid's testing utility: 

```
npm install @testingjs/app
```

Then, the only requirement is that you have an `app.js` file in your source directory that exports your Druid app. Our testing utility will require this file to start up your app while testing.

For example:

```js
// src/app.js
import Druid from '@druidjs/app'
import * as knex from 'knex'

const connection = knex(process.env.DATABASE)

const app = new Druid(connection)

export default app

// you would now start up your server in a different file, for example: 
// server.js 
import app from './src/app'

app.listen()
```

## Graphql Testing

Druid makes it easy to test against your Graphql API while keeping your database clean. All you have to do is start our testing server and make sure to use its helper methods to cleanup after each test.

*The examples below use the [Jest](https://github.com/facebook/jest/) testing framework, but you can use any testing library.*

Here's an example of what that may look like:

```js
import { createTestServer } from '@druidjs/testing'

let server

// Start the testing server
beforeAll(async () => { 
  server = await createTestServer()
})

// Rollback any database transactions after each test
afterEach(async () => { 
  await server.rollback() 
})

// Destroy the database connection
afterAll(async () => { 
  await server.destroy() 
})
```

Then in your tests, you can use `server.request` to test your graphql resolvers:

```js
 it('can get all users user', async () => {
  const result = await server.request({
     query: `
      query User($username: String) {
        user(username: $username) {
          id
          username
        }
      }
    `,
    variables: {
      username: 'admin'
    }
  })
  expect(result.data.users).toEqual('admin')
})
```

If you need to test a resolver only intended for authenticated users, you can use our `withAuthHeaders` helper, which takes a `userId` and includes the appropriate headers into the response for you:

```js
import { withAuthHeader } from '@druidjs/testing'

 it('can get auth user', async () => {
   const reqData = withAuthHeader(ADMIN_USER.id, {
    query: `
      query AuthUser {
        authUser {
          id
          username
        }
      }
    `
  })
  const result = await server.request(reqData)
  expect(result.data.authUsers).toBeTruthy()
})
```

The `server.request` function takes an object with the following properties: 

- `headers`: Object of response headers sent to client
- `query` or `mutation`: String which contains the the Graphql request 
- `variables`: Object of variables to pass to the graphql request

The `server` itself has the following API:

- `app`, the instance of the Apollo Server application.
- `db`, the instance of database object that's passed to all resolvers (i.e. `ctx.db`).
- `request`, helper Function to test graphql resolver. This method is intended for testing successfull graphql requests since, to make our life easier, it will log any errors contained in graqphql response (via `result.data.errors`).
- `requestFail`, helper Function to test failure edge cases of graphql resolves. Unlike the regular `request`, this method will not log any failures to the console.
- `rollback`, Function to rollback all database transactions.
- `destory`, Function to destroy the database connection.
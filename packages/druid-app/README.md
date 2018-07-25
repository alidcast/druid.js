# druidjs/app

- [App Setup](#app-setup)
- [App Concepts](#app-concepts)
  - [Database models](#database-models)
  - [Graphql typeDefs, resolvers, and scalars](#database-models)
  - [Server Context](#context)
  - [Putting it all together](#putting-it-all-together)

## App Setup

Druid autloads your application logic based on preconfigured paths so that you can streamline your API setup.

Druid is built on top of [apolo-server](https://github.com/apollographql/apollo-server) (for responding to Graphql requests) and [objection.js](https://github.com/Vincit/objection.js/) (for querying your database). If you're not familar with the above libraries, we recommended scanning through their documentation first.

To get started with Druid, first, install the package: 

```
npm install @druidjs/app
```

Then, initialize Druid. You must pass it a [knex connection](https://github.com/tgriesser/knex) (the query builder Objection.js uses), which Druid will automatically bind to all your database models.

```js
// app.js
import Druid from '@druidjs/app'
import * as knex from 'knex'

const connection = knex({
  client: process.env.DB_CLIENT,
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD
  }
})

const app = new Druid(connection)

app.listen(4000)
```

Now that you've done that, now you can create your database `models`, along with your graphql `typeDefs`/`resolvers`,will all be autoloaded by Druid. By default, all modules are found under the following glob pattern: `src/entities/**/*.{module}.{js,ts}`.

Here's what the default, recommended folder structure would look like:

```
/src
  /entities # all entities to be autoloaded by Druid 
    /User
      /model.js
      /resolvers.ts
      /typeDefs.js
  app.js # your druid application
```

But as advertised, Druid takes the shape of your application. So you can pass custom paths, along with other settings, as the second parameter to Druid. Here are the defaults:

```js
new Druid(connection, {
  appKey: process.env.APP_KEY, // Secret application key (required for authentation helpers)
  path: '/graphql', // Graphql API endpoint
  srcDir: './src', // Base path to all autoloaded modules
  modulePaths: {
    models: './entities/**/model.*(ts|js)',
    scalars: './entities/**/scalars.*(ts|js)',
    typeDefs: './entities/**/typeDefs.gql',
    resolvers: './entities/**/resolvers.*(ts|js)'
  }
})

```

## App Concepts 

In the next three sections, we briefly explain the core parts of a Druid application. Then we'll bring it all together with example code.

### Database `models`

Your database `models` are the internal components of your application and primary means for interacting with your database.

See the [objection.js](https://github.com/Vincit/objection.js/) documentation to learn how to setup your models. 

Druid will automatically bind the database `connection` to all models, and inject them in the [`ctx`](#server-context) passed to your graphql resolvers.

All autoloaded models will be named based on the name of their parent directory. So, for example, a model found under `User/model.js`, can be accessed inside a graphql resolver as `ctx.db.User`.

### Graphql `typeDefs`, `resolvers`, and `scalars`

Your graphql `typeDefs`, `resolvers`, and `scalars` are the external components of your application and primary means for specifying how graphql clients will interact with your API.

See the [apollo-server](https://github.com/apollographql/apollo-server) documentation to learn how to setup your graphql API.

Druid will merge all autloaded graphql logic into a single `schema` which it will pass to your apollo server.

`resolvers` and `scalars` will be merged according to the name of their exports. So for resolvers you should export a `Query` and `Mutation` property, and for `scalars` you should export the name of the specific scalar.

### Server Context

A `ctx` object is passed as the third paramter to all your graphql resolvers. This object will contain all your autloaded `models` via `ctx.db`, along `authentication` helpers via `ctx.auth`.

// TODO allow customization of druid context

### `ctx` API

* `db`, Object which contains all database related helpers.
  - `$connection`, original databsae connection
  - ....all autloaded models
* `auth`, Object which contains all authentication related helpers.
  - `generateToken`, Function to generate authentication token.
  - `getUser`, Function to get authenticated user. Will fail if user is not auhtenticated.
  - `getUserId`, Function to get autenticated user id. Will fail if user is not auhtenticated.
  - `maybeGetUser`, Function to get authenticated user. Will return `null` if no user is authenticated.


### Putting it all together

Here's a basic example which shows the different components of a Druid application, along with usage of the context object inside resolvers.

```js
// User/model.js

import { Model } from 'objection'

export default class User extends Model {
  static get tableName() {
    return 'users'
  }
}

// User/typeDefs.js

type Query {
  authUser: User!
}

type Mutation {
  registerUser(username: String!, password: String!): AuthUserData!
  loginUser(username: String!, password: String!): AuthUserData!
}

type User {
  id: Int! 
  username: String! 
  password: String!
}

type AuthUserData {
  user: User!
  token: String!
}

// User/resolvers.js

export const Query = {
  async authUser (_, __, { auth }) {
    const authUser = await auth.getUser()
    return authUser
  }
}

export const Mutation = {
  async createUser (root, { username, password }, { db }) {
    return db.User.query().insert({ username, password })
  }

  async registerUser (_, { username, email, password }, { auth, db }) {
    const user = await db.User.query().insert({ username, email, password })
    const token = auth.generateToken(user.id)
    return { user, token }
  },

  async loginUser (_, { username, password }, { auth, db }) {
    const user = await db.User.query().where('username', username)
    await user.verifyPassword(password, user.password)
    const token = auth.generateToken(user.id)
    return { user, token }
  }
}
```

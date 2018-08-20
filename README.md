# Druid.js

> The "shapeshifting" API framework for Node.js+Graphql applications

- [Introduction](#introduction)
- [Packages](#packages)

## Introduction 

Druid streamlines the process of creating a Node.js API, so that you can focus on the logic that's unique to your application.

We're able to remove all boilerplate for you, because we leverage the elegance of [Graphql](https://graphql.org/), which dispenses with the need for tying together disparate routes and controllers. Instead, a Druid application is composed of `entities` (a database `model`, along with its graphql `typeDefs`/`resolvers`), which Druid autoloads for you based on preconfigured paths. 

We call Druid a "shapeshifting" framework, because it takes the shape of the entities that compose your API.

As an example, here's the default folder structure of a simple Druid app:

```
/src
  /entities # all entities to be autoloaded by Druid 
    /User
      /model.js
      /resolvers.js
      /typeDefs.gql
  app.js # your druid application
```

Unlike other Node.js frameworks, Druid isn't trying to be "the next Ruby on Rails." Node.js has its own modular, lightweight way of doing things, and Druid maintains that spirit.

Druid's itself, is focused only on one job: tying together your application's `entities`. As for the application logic itself, we shamelessly delegate the heavy lifting to two great libraries:

 - [apolo-server](https://github.com/apollographql/apollo-server), for responding to Graphql requests.
 - [objection](https://github.com/Vincit/objection.js/) / [knex](http://knexjs.org), for querying your database.

Before you use Druid, we suggest you become famililar with the above libraries, and with Node.js ecosystem as a whole so that you can understand and appreciate why we chose the above technologies.

But anyway, enough talk, here's a brief look at how your API will look like going forward:

```js
// app.js
// Setup your Druid application.

import Druid from '@druidjs/app'
import * as knex from 'knex'

const connection = knex(process.env.DATABASE)

const app = new Druid(connection)

app.listen(4000)

// src/User/model.js
// Setup a datase model for querying your databse.
// This model can be accessed inside resolvers via `ctx.db.User`.

import { Model } from 'objection'

export default class User extends Model {
  static get tableName() {
    return 'users'
  }
}

// src/User/typeDefs.gql 
// Define the entry points of your API.

type Mutation {
  createUser(username: String!, password: String!): User!
}

type User {
  id: Int! 
  username: String! 
  password: String!
}

// src/User/resolvers.js
// Resolve the entry points of your API.
// The `ctx` contains access to the model we setup above, as well as other helpers we provide for you.

export const Mutation = {
  async createUser (root, args, ctx) {
    const { username, password } = args
    const user = await ctx.db.User.query().insert({ username, password })
    const token = ctx.auth.generateToken(user.id)
    return { user, token }
  }
}
```

Like what you're seeing? Read the [app setup](https://github.com/alidcastano/druid.js/tree/master/packages/druid-app#app-setup) section to start using Druid.

## Packages

🚧 Under Construction 🚧

There are two Druid packages: 

- [`@druidjs/app`](https://github.com/alidcastano/druid.js/tree/master/packages/druid-app), holds the core modules for the Druid framework. You can use this package to streamline your Node.js+Graphql API setup.
- [`@druidjs/mixins`](https://github.com/alidcastano/druid.js/tree/master/packages/druid-mixins), holds
the model mixins for Druid. You can use package to enhance your Objection.js models with commonly used functionality.
- [`@druidjs/testing`](https://github.com/alidcastano/druid.js/tree/master/packages/druid-testing), holds
testing utilities for Druid. You can use package to test your API while keeping your database clean.

Each of the above packages holds its respective documentation inside its `README.md`.

## Author

- Alid Castano ([@alidcastano](https://twitter.com/alidcastano))

## Liscense

[MIT](/LICENSE.md)
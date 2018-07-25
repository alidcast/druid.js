# Druid

🚧 Under Construction 🚧


explain why you wrap existing/tested frameworks rather than creating your own ecosystem


With Druid, you can create Node.js API completely focused on your database `enitites`.

We're able to streamline this process for you by leveraging the brilliance of [Graphql](https://graphql.org/), which elimiates the need for tying together disparate routes and controllers. Instead, Druid autoloads all your `database` and `graphql` logic based on preconfigured paths. This way, we can elimate all boilerplate required to setup a Node.js API and you can focus on the logic that's unique to your application.

As an added benefit, we have built-in support for Authentication and Testing.

But anyway, enough talk, here's a brief look at how your APIs will look like going forward:

```js
// app.js
import Druid from '@druidjs/app'
import * as knex from 'knex'

const connection = knex(process.env.DATABASE)

const app = new Druid(connection)

app.listen(4000)
```

With minimal code, we get the autloading of all your database `models` and graphql `typeDefs`, `resolvers`, which are found by default under `src/entities/**/*.{module}.{js,ts}`.

Example folder structure:

```
/src
  /entities # all entities to be autoloaded by Druid 
    /User
      /model.js
      /resolvers.ts
      /typeDefs.js
  app.js # your druid application
```

Example entity logic: 

```js
// User/model.js
import { Model } from 'objection'

export default class User extends Model {
  static get tableName() {
    return 'users'
  }
}

// User/typeDefs.js
type Mutation {
  createUser(username: String!, password: String!): User!
}

type User {
  id: Int! 
  username: String! 
  password: String!
}

// User/resolvers.js
export const Mutation = {
  async createUser (root, { username, password }, { db }) {
    return db.User.query().insert({ username, password })
  }
}
```

Like what you're seeing? Read the [getting-started](https://github.com/alidcastano/druid.js/tree/master/packages/druid-app#getting-started) section to start using Druid!

## Packages

There are two Druid packages: 

- [`@druidjs/app`](https://github.com/alidcastano/druid.js/tree/master/packages/druid-app), holds the core modules for the Druid framework. You can use this package to streamline your graphql API setup.
- [`@druidjs/testing`](https://github.com/alidcastano/druid.js/tree/master/packages/druid-testing), holds
testing utilities for Druid. You can use package to test your API while keeping your database clean.

Each of the above packages holds its respective documentation inside its `README.md`.

## Author

- Alid Castano ([@alidcastano](https://twitter.com/alidcastano))

## Liscense

[MIT](/LICENSE.md)
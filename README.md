# Druid

🚧 Under Construction 🚧

Here's an example Druid application: 

```js

import Druid from '@druidjs/app'
import * as knex from 'knex'

const connection = knex(process.env.DATABASE)

const app = new Druid(connection, { appKey: process.env.APP_KEY })

app.listen(4000)

```

Out of the box you get:

- Autoloading of all database `models`.
- Autoloading of all graphql `typeDefs`, `resolvers`, and `scalars`.

By default, these modules will be looked for in `src/entities/**/*.{module}.js`.

There are two Druid packages: 

- [`@druidjs/app`](https://github.com/alidcastano/druid.js/tree/master/packages/druid-app), holds the core modules for the Druid framework. You can use this package to streamline your graphql+objection API setup.
- [`@druidjs/testing`](https://github.com/alidcastano/druid.js/tree/master/packages/druid-testing), holds
testing utilities for Rogue. You can use this package to setup tests for your graphql resolvers.

Each of the above packages holds its respective documentation inside its `README.md`.

## Author

- Alid Castano ([@alidcastano](https://twitter.com/alidcastano))

## Liscense

[MIT](/LICENSE.md)
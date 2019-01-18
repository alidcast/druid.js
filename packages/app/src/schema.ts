import { fileLoader, mergeTypes, mergeResolvers } from 'merge-graphql-schemas'
import { makeExecutableSchema } from 'graphql-tools'
import { findFiles, importFile } from './utils'

export default function schemaLoader (options) {
  const { modulePaths } = options  
  const schema = {} as any 

  const scalars = loadScalars(modulePaths.scalars)

  schema.typeDefs = mergeTypes([
    ...scalars.typeDefs,
    ...fileLoader(modulePaths.typeDefs, { recursive: true })
  ])

  schema.resolvers = mergeResolvers([
    scalars.resolvers,
    ...fileLoader(modulePaths.resolvers, { recursive: true })
  ])

  let gqlSchema
  try {
    gqlSchema = makeExecutableSchema(schema)
  } catch (err) { // TODO consider throwing actual error and doing try-catch-log in testing
    console.log('Error while loading your schema' + err)
  }
  return gqlSchema
}

function loadScalars (scalarsPath: string): { typeDefs: Array<string>, resolvers: object } {
  const typeDefs = []
  const resolvers = {}
  findFiles(scalarsPath).forEach((scalarPath : any) => {
    const scalars = importFile(scalarPath)
    Object.keys(scalars).forEach(scalarName => {
      typeDefs.push(`scalar ${scalarName}`)
      resolvers[scalarName] = scalars[scalarName]
    })
  })
  return { typeDefs, resolvers }
}

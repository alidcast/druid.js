import { fileLoader, mergeTypes, mergeResolvers } from 'merge-graphql-schemas'
import { makeExecutableSchema } from 'graphql-tools'
import { findFiles, importFile, getNameFromPath } from './utils'

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

  return makeExecutableSchema(schema)
}

function loadScalars (scalarsPath: string): { typeDefs: Array<string>, resolvers: object } {
  const typeDefs = []
  const resolvers = {}
  findFiles(scalarsPath).forEach((scalarPath : any) => {
    const scalarName = getNameFromPath(scalarPath)
    typeDefs.push(`scalar ${scalarName}`)
    resolvers[scalarName] = importFile(scalarPath).default
  })
  return { typeDefs, resolvers }
}

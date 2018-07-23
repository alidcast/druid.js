import { findFiles, importFile, getDirNameFromPath } from '../utils'

let models 
export default function initDb (connection, options) {
  models = (process.env.NODE_ENV === 'production' && !!models) ? models : loadModels(connection, options.modulePaths.models)

  return {
    $connection: connection,
    ...models
  }
}

function loadModels (connection, modelsPath: string) {
  const models = {}
  findFiles(modelsPath).forEach((modelPath: string) => {
    const modelName = getDirNameFromPath(modelPath)
    const Model = importFile(modelPath).default 
    // bind database connection to each model
    // this allows us to support multiple databases and testing transactions)
    models[modelName] = Model.bindTransaction(connection)
  })
  return models 
}
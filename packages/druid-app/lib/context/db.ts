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

    let modelClass 
    try {
      modelClass = Model.bindTransaction(connection)
    } catch (err) {
      console.log('Error while loading models' + err)
    }
  
    models[modelName] = modelClass
  })
  return models 
}
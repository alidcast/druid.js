import { findFiles, importFile, getDirNameFromPath } from '@druidjs/path-utils'

const dev = process.env.NODE_ENV !== 'production'

let models 
export function initDb(connection, { modulePaths }) {
  models = (!dev && !!models) ? models : loadModels(connection, modulePaths.models)

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
      throw (err)
    }
  
    models[modelName] = modelClass
  })
  return models 
}
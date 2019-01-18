export default function searchIndexQueries (index) {
	function addToIndex (objects: any[]) {
		index.addObjects(serializeObjects(objects))
	}
	
	function updateInIndex (objects: any[]) {
		index.saveObjects(serializeObjects(objects))
	}
	
	function removeFromIndex (objects: any[]) {
		const objectIds = objects.map(obj => obj.id)
		index.deleteObjects(objectIds)
	}

	return (Model): typeof Model => {
    class IndexQB extends Model.QueryBuilder {
			index () {
				this
					.returning('*')
					.mergeContext({
						runAfter (result) {
							const data = !Array.isArray(result) ? [result] : result
							addToIndex(data)
							return result
						}
					})
				return this
			}
		
			reindex () {
				this
					.returning('*')
					.mergeContext({
						runAfter (result) {
							const data = !Array.isArray(result) ? [result] : result
							updateInIndex(data)
							return result
						}
					})
				return this
			}
		
			unindex () {
				this
					.returning('*')
					.mergeContext({
						runAfter (result) {
							const data = !Array.isArray(result) ? [result] : result
							removeFromIndex(data)
							return result
						}
					})
				return this
			}
		}

		return class extends Model {
      static get QueryBuilder() {
        return IndexQB
      }
    }
	}
}

function serializeObjects(objects) {
	return objects.map(obj => ({ ...obj, objectID: obj.id }))
}
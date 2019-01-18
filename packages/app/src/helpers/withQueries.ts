export default function	withQueries (queries) {
	return (Model): typeof Model => {
		class CustomQB extends Model.QueryBuilder<any> {}
		Object.keys(queries).forEach(query => CustomQB.prototype[query] = queries[query])

		return class extends Model {
			static get QueryBuilder() {
				return CustomQB
			}
		}
	}
}

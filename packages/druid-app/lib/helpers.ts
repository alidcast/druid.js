import { QueryBuilder } from 'objection'

export function	withQueries (queries) {
	class CustomQB extends QueryBuilder<any> {}
	Object.keys(queries).forEach(query => CustomQB.prototype[query] = queries[query])

	return (Model): typeof Model => class extends Model {
		static get QueryBuilder() {
			return CustomQB
		}
	}
}

# druidjs/mixins


## Soft Deletes

The soft delete mixin takes the following options:

- `columnName`: string, the name of the column to mark with the soft delete.
- `softDelete`: string, the name of the query key that will be used as a soft delete.
- `undelete`: string, the name of the query key that will be used to undo a soft delete.
- `hardDelete`: string, the name of the query key that will be used to permanently delete a row. By default, `delete` key is used.
 
Example inittialization: 

```js
import softDeleteQueries from '@druidjs/mixins/softDelete'


const archiveQueries = softDeleteQueries({
  columnName: 'archived',
  softDelete: 'archive',
  undelete: 'unarchive'
})

export default class Note extends archiveQueries(Model) {	
}
```


## Search Index

Initialized mixin with algolia search index.

The following queries exist:
- `index`, to add object(s) to search index.
- `reindex`, to update object(s) in search index.
- `unindex`, to remove object(s) from search index.

Example initialization: 

```js
import * as algoliasearch from 'algoliasearch'
import searchIndexQueries from '@druidjs/mixins/searchAlgolia'

const algolia = algoliasearch(process.env.SEARCH_ID, process.env.SEARCH_KEY)
const searchIndex = algolia.initIndex('test')


export default class Note extends searchIndexQueries(searchIndex)(Model) {	
}
```
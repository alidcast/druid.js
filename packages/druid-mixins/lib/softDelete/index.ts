// inspired by: https://github.com/griffinpp/objection-soft-delete

const defaultOptions = {
  columnName: 'deleted',
  softDelete: 'softDelete',
  undelete: 'undelete',
  hardDelete: 'delete'  // Hard delete = regular delete
}

export default function withSoftDeleteQueries (userOptions = {}) {
  const opts = { ...defaultOptions, ...userOptions }

  return (Model): typeof Model => {
    class SoftDeleteQB extends Model.QueryBuilder {
      [opts.softDelete] () {
        return this.patch({ [opts.columnName]: true })
      }
    
      [opts.hardDelete] () {
        return super.delete()
      }

      [opts.undelete] () {
        return this.patch({ [opts.columnName]: false })
      }
    }
  
    return class extends Model {
      static get QueryBuilder() {
        return SoftDeleteQB
      }
    }
  }
}
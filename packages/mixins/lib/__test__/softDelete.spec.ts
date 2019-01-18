import { Model } from 'objection'
import * as Knex from 'knex'
import * as fs from 'fs'
import softDeleteQueries from '../softDelete'

const TEST_TABLE = 'SoftDelete'

const fixtures = [
  { id: 1, deleted: false, archived: false },
  { id: 2, deleted: false, archived: false },
]

function testModel(opts = {}) {
  return class TestModel extends softDeleteQueries(opts)(Model) {
    static get tableName() {
      return TEST_TABLE
    }
  }
}

let knex

beforeAll(async () => {
  knex = Knex({
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {  filename: './test.db' }
  })
  await knex.schema.createTable(TEST_TABLE, (table) => {
    table.increments('id').primary()
    table.boolean('deleted')
    table.boolean('archived')
  })
})

afterAll(async () => {
  await knex.schema.dropTable(TEST_TABLE)
  await knex.destroy()
  return setTimeout(() => fs.unlinkSync('./test.db'), 100)
})



beforeEach(async () => {
  await knex(TEST_TABLE).insert(fixtures)
})

afterEach(async () => {
  await knex(TEST_TABLE).delete()
})

describe('Default Soft Delete QB', () => {
  let model 
  beforeAll(() => {
    model = testModel()
  })

  it('.undelete - unmarks deleted row', async () => {
    await model.query(knex).where('id', 1).softDelete()
    await model.query(knex).where('id', 1).undelete()
    const row = await model.query(knex).where('id', 1).first()
    expect(row.deleted).toBeFalsy()
  })

  it('.softDelete - marks row as deleted', async () => {
    await model.query(knex).where('id', 1).softDelete()
    const row = await model.query(knex).where('id', 1).first()
    expect(row.deleted).toBeTruthy
  })

  it('.delete - still removes row from database', async () => {
    await model.query(knex).where('id', 1).delete()
    const row = await model.query(knex).where('id', 1).first()
    expect(row).toBeUndefined()
  })
})

describe('Custom Soft Delete QB - "archive"', () => {
  let model 
  beforeAll(() => {
    model = testModel({ 
      columnName: 'archived', 
      softDelete: 'archive',
      undelete: 'unarchive',
      whereDeleted: 'whereArchived',
      whereNotDeleted: 'whereNotArchived'
    })
  })

  it('.archive - marks row as archived', async () => {
    await model.query(knex).where('id', 1).archive()
    const row = await model.query(knex).where('id', 1).first()
    expect(row.archived).toBeTruthy()
  })

  it('.unarchive - unmarks archived row', async () => {
    await model.query(knex).where('id', 1).archive()
    await model.query(knex).where('id', 1).unarchive()
    const row = await model.query(knex).where('id', 1).first()
    expect(row.archived).toBeFalsy()
  })
})
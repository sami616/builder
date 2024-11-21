import { openDB, type DBSchema } from 'idb'
import { type DBStores } from '@repo/lib'

export const db = await openDB<MyDB>('pageManager', 1, {
  upgrade(db) {
    // create a store of objects if it doesnt already exist
    if (!db.objectStoreNames.contains('pages')) {
      const store = db.createObjectStore('pages', { keyPath: 'id', autoIncrement: true })
      store.createIndex('createdAt', 'createdAt', { unique: false })
      store.createIndex('updatedAt', 'updatedAt', { unique: false })
      store.createIndex('slug', 'slug', { unique: true })
    }

    if (!db.objectStoreNames.contains('blocks')) {
      const store = db.createObjectStore('blocks', { keyPath: 'id', autoIncrement: true })
      store.createIndex('createdAt', 'createdAt', { unique: false })
      store.createIndex('updatedAt', 'updatedAt', { unique: false })
    }

    if (!db.objectStoreNames.contains('templates')) {
      const store = db.createObjectStore('templates', { keyPath: 'id', autoIncrement: true })
      store.createIndex('createdAt', 'createdAt', { unique: false })
      store.createIndex('updatedAt', 'updatedAt', { unique: false })
      store.createIndex('order', 'order', { unique: false })
    }
  },
})

export type DB = {
  templates: {
    key: DBStores['Template']['id']
    value: DBStores['Template']
    indexes: {
      createdAt: DBStores['Template']['createdAt']
      updatedAt: DBStores['Template']['updatedAt']
      order: DBStores['Template']['order']
    }
  }
  pages: {
    key: DBStores['Page']['id']
    value: DBStores['Page']
    indexes: {
      createdAt: DBStores['Page']['createdAt']
      updatedAt: DBStores['Page']['updatedAt']
      slug: DBStores['Page']['slug']
    }
  }
  blocks: {
    key: DBStores['Block']['id']
    value: DBStores['Block']
    indexes: {
      createdAt: DBStores['Block']['createdAt']
      updatedAt: DBStores['Block']['updatedAt']
    }
  }
}

export interface MyDB extends DB, DBSchema {}

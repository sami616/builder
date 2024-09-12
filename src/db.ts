import { openDB, type DBSchema } from 'idb'

export const db = await openDB<MyDB>('experienceManager', 1, {
  upgrade(db) {
    // create a store of objects if it doesnt already exist
    if (!db.objectStoreNames.contains('experiences')) {
      const store = db.createObjectStore('experiences', {
        keyPath: 'id',
        autoIncrement: true,
      })

      store.createIndex('createdAt', 'createdAt', { unique: false })
      store.createIndex('updatedAt', 'updatedAt', { unique: false })
    }

    if (!db.objectStoreNames.contains('blocks')) {
      const store = db.createObjectStore('blocks', {
        keyPath: 'id',
        autoIncrement: true,
      })
      store.createIndex('createdAt', 'createdAt', { unique: false })
      store.createIndex('updatedAt', 'updatedAt', { unique: false })
    }

    if (!db.objectStoreNames.contains('templates')) {
      const store = db.createObjectStore('templates', {
        keyPath: 'id',
        autoIncrement: true,
      })
      store.createIndex('createdAt', 'createdAt', { unique: false })
      store.createIndex('updatedAt', 'updatedAt', { unique: false })
    }
  },
})

export interface MyDB extends DBSchema {
  experiences: {
    key: Experience['id']
    value: Experience
    indexes: {
      createdAt: Experience['createdAt']
      updatedAt: Experience['updatedAt']
    }
  }
  blocks: {
    key: Block['id']
    value: Block
    indexes: {
      createdAt: Block['createdAt']
      updatedAt: Block['updatedAt']
    }
  }
  templates: {
    key: Template['id']
    value: Template
    indexes: {
      createdAt: Template['createdAt']
      updatedAt: Template['updatedAt']
    }
  }
}

export type Sys = {
  id: number
  createdAt: Date
  updatedAt: Date
}

export type Experience = Sys & {
  store: 'experiences'
  name: string
  status: 'published' | 'draft' | 'changed'
  slots: { [index: string]: Array<Block['id']> }
}
export type Block = Sys & {
  store: 'blocks'
  type: string
  name: string
  slots: { [index: string]: Array<Block['id']> }
  props: { [index: string]: any }
}

export type Template = Sys & {
  store: 'templates'
  name: string
  slots: { [index: string]: Array<Block['id']> }
}

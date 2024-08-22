import { openDB, type DBSchema } from 'idb'
import { type ComponentProps } from 'react'
import * as components from './components'

export const db = await openDB<MyDB>('experienceManager', 1, {
  upgrade(db) {
    // create a store of objects if it doesnt already exist
    if (!db.objectStoreNames.contains('experiences')) {
      const store = db.createObjectStore('experiences', {
        keyPath: 'id',
        autoIncrement: true,
      })

      store.createIndex('slug', 'slug', { unique: true })
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
  },
})

export interface MyDB extends DBSchema {
  experiences: {
    key: Experience['id']
    value: Experience
    indexes: {
      createdAt: Experience['createdAt']
      slug: Experience['slug']
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
}

export type Experience = {
  id: number
  name: string
  slug: string
  createdAt: Date
  updatedAt: Date
  status: 'published' | 'draft' | 'changed'
  blocks: Array<Block['id']>
}

export type Block = {
  [K in keyof typeof components]: {
    id: number
    createdAt: Date
    updatedAt: Date
    type: K
    props: ComponentProps<(typeof components)[K]>
  }
}[keyof typeof components]

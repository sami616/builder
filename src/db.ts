import { openDB, type DBSchema } from 'idb'
import { type ComponentProps } from 'react'
import * as blocks from './blocks'
import { type Blocks } from './utils'

export interface Experience {
  id: number
  name: string
  slug: string
  createdAt: Date
  updatedAt: Date
  status: 'published' | 'draft' | 'changed'
  blocks: Array<
    {
      [K in Blocks]: {
        id: string
        type: K
        props: ComponentProps<(typeof blocks)[K]>
      }
    }[Blocks]
  >
}

export interface MyDB extends DBSchema {
  experiences: {
    key: Experience['id']
    value: Experience
    indexes: { createdAt: Experience['createdAt']; slug: Experience['slug'] }
  }
}

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
    }
  },
})

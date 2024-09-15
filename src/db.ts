import { openDB, type DBSchema } from 'idb'

export const db = await openDB<MyDB>('experienceManager', 1, {
  upgrade(db) {
    // create a store of objects if it doesnt already exist
    if (!db.objectStoreNames.contains('experiences')) {
      const store = db.createObjectStore('experiences', { keyPath: 'id', autoIncrement: true })

      store.createIndex('createdAt', 'createdAt', { unique: false })
      store.createIndex('updatedAt', 'updatedAt', { unique: false })
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
      store.createIndex('order', 'order', { unique: true })
    }
  },
})

export interface MyDB extends DBSchema {
  templates: {
    key: Template['id']
    value: Template
    indexes: {
      createdAt: Template['createdAt']
      updatedAt: Template['updatedAt']
      order: Template['order']
    }
  }
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
}

export type Indexes = {
  Block: keyof MyDB['blocks']['indexes']
  Experience: keyof MyDB['experiences']['indexes']
  Template: keyof MyDB['templates']['indexes']
}

export type Sys = {
  id: number
  createdAt: Date
  updatedAt: Date
}

export type Experience = {
  store: 'experiences'
  name: string
  status: 'published' | 'draft' | 'changed'
  slots: { [index: string]: Array<Block['id']> }
} & Sys

export type Block = {
  store: 'blocks'
  type: string
  name: string
  slots: { [index: string]: Array<Block['id']> }
  props: { [index: string]: any }
} & Sys

export type Template = {
  store: 'templates'
  order: number
  name: string
  block: Block['id']
} & Sys

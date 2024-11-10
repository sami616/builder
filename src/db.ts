import { openDB, type DBSchema } from 'idb'

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
    key: Template['id']
    value: Template
    indexes: {
      createdAt: Template['createdAt']
      updatedAt: Template['updatedAt']
      order: Template['order']
    }
  }
  pages: {
    key: Page['id']
    value: Page
    indexes: {
      createdAt: Page['createdAt']
      updatedAt: Page['updatedAt']
      slug: Page['slug']
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

export interface MyDB extends DB, DBSchema {}

export type Sys = {
  id: number
  createdAt: Date
  updatedAt: Date
}

export type Page = {
  store: 'pages'
  title: string
  slug: string
  url: string
  description: string
  status: 'published' | 'draft' | 'changed'
  publishedAt?: Date
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
  rootNode: Block
  slots: { [index: string]: Array<Block['id']> }
} & Sys

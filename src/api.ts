import { type Block, type Page, Template, db, type DB } from './db'

export async function get<Store extends keyof DB>(args: { store: Store; id: DB[Store]['value']['id'] }): Promise<DB[Store]['value']> {
  const tx = db.transaction(args.store, 'readonly')
  const [entry] = await Promise.all([tx.store.get(args.id), tx.done])
  if (!entry) throw new Error('Entry not found')
  return entry
}

type SortBy = 'ascending' | 'descending'

const map = new Map([
  ['descending', 'next'],
  ['ascending', 'prev'],
] as const)

export async function getMany<Store extends keyof DB, Indexes extends keyof DB[Store]['indexes']>(args: {
  store: Store
  sortBy: [Indexes, SortBy]
}): Promise<Array<DB[Store]['value']>> {
  const entries = []
  const tx = db.transaction(args.store, 'readonly')

  const [by, order] = args.sortBy

  const index = tx.store.index(by)
  let cursor = await index.openCursor(null, map.get(order))
  while (cursor) {
    entries.push(cursor.value)
    cursor = await cursor.continue()
  }

  return entries
}
type Root = { [K in keyof DB]: { store: K; id: DB[K]['value']['id'] } }[keyof DB]

// getTree
export async function getTree({ entries = [], ...args }: { root: Root; entries?: Array<Block | Page | Template> }) {
  const entry = await get({ id: args.root.id, store: args.root.store })
  const slots = Object.keys(entry.slots)
  for (const key of slots) {
    for (const id of entry.slots[key]) {
      await getTree({ root: { store: 'blocks', id }, entries })
    }
  }
  entries.push(entry)
  return entries
}

export async function duplicateTree(args: { tree: Awaited<ReturnType<typeof getTree>> }) {
  const idMap = new Map()
  let rootEntry = null

  for (const entry of args.tree) {
    const clonedEntry = structuredClone(entry)

    const date = new Date()
    clonedEntry.createdAt = date
    clonedEntry.updatedAt = date

    for (var slot in entry.slots) {
      clonedEntry.slots[slot] = entry.slots[slot].map((id) => idMap.get(id))
    }

    const { id, ...clonedEntryWithoutId } = clonedEntry
    const rootId = await add({ entry: clonedEntryWithoutId })
    rootEntry = { ...clonedEntry, id: rootId }
    idMap.set(entry.id, rootId)
  }

  if (!rootEntry) throw new Error('No op')
  return rootEntry
}

// add
export async function add(args: { entry: Omit<Page, 'id'> | Omit<Block, 'id'> | Omit<Template, 'id'> }) {
  const tx = db.transaction(args.entry.store, 'readwrite')
  const [id] = await Promise.all([tx.store.add(args.entry as Block | Page | Template), tx.done])
  return id
}

// addMany
export async function addMany(args: { entries: Array<Page | Block | Template> }) {
  const expTx = db.transaction('pages', 'readwrite')
  const bloTx = db.transaction('blocks', 'readwrite')
  const tempTx = db.transaction('templates', 'readwrite')
  const promises = args.entries.map((entry) => {
    if (isBlock(entry)) return bloTx.store.add(entry)
    if (isTemplate(entry)) return tempTx.store.add(entry)
    if (isPage(entry)) return expTx.store.add(entry)
    throw new Error('no  op')
  })
  const ids = await Promise.all([...promises, expTx.done, bloTx.done, tempTx.done])
  return ids.filter(Boolean)
}

// update
export async function update(args: { entry: Page | Block | Template }) {
  const tx = db.transaction(args.entry.store, 'readwrite')
  const [id] = await Promise.all([tx.store.put(args.entry), tx.done])
  return id
}

// updateMany
export async function updateMany(args: { entries: Array<Page | Block | Template> }) {
  const expTx = db.transaction('pages', 'readwrite')
  const bloTx = db.transaction('blocks', 'readwrite')
  const tempTx = db.transaction('templates', 'readwrite')
  const promises = args.entries.map((entry) => {
    if (isBlock(entry)) return bloTx.store.put(entry)
    if (isTemplate(entry)) return tempTx.store.put(entry)
    if (isPage(entry)) return expTx.store.put(entry)
    throw new Error('no  op')
  })
  const ids = await Promise.all([...promises, expTx.done, bloTx.done, tempTx.done])
  return ids.filter(Boolean)
}

// remove
export async function remove(args: { entry: Page | Block | Template }) {
  const tx = db.transaction(args.entry.store, 'readwrite')
  await Promise.all([tx.store.delete(args.entry.id), tx.done])
}

// removeMany
export async function removeMany(args: { entries: Array<Page | Block | Template> }) {
  const expTx = db.transaction('pages', 'readwrite')
  const bloTx = db.transaction('blocks', 'readwrite')
  const tempTx = db.transaction('templates', 'readwrite')
  const promises = args.entries.map((entry) => {
    if (isBlock(entry)) return bloTx.store.delete(entry.id)
    if (isTemplate(entry)) return tempTx.store.delete(entry.id)
    if (isPage(entry)) return expTx.store.delete(entry.id)
    throw new Error('no  op')
  })
  await Promise.all([...promises, expTx.done, bloTx.done, tempTx.done])
}

export function isBlock(args: Omit<Block | Page | Template, 'id'>): args is Block {
  return args.store === 'blocks'
}

export function isTemplate(args: Omit<Block | Template | Page, 'id'>): args is Template {
  return args.store === 'templates'
}

export function isPage(args: Omit<Block | Page | Template, 'id'>): args is Page {
  return args.store === 'pages'
}

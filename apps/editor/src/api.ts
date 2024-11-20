import { db, type Block, type DB, type Page, type Template } from '#db.ts'
import { generateSlug } from 'random-word-slugs'

export async function slow(delay: number = 0) {
  return new Promise((resolve) => setTimeout(resolve, delay))
}

export async function error(show: boolean = false) {
  if (show) throw new Error('Something went wrong')
}

export async function get<Store extends keyof DB>(args: { store: Store; id: DB[Store]['value']['id'] }): Promise<DB[Store]['value']> {
  await slow()
  error()
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
  await slow()
  error()
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
  await slow()
  error()
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
  await slow()
  error()
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
    if (isPage(clonedEntryWithoutId)) {
      clonedEntryWithoutId.slug = generateSlug()
      clonedEntryWithoutId.publishedAt = undefined
      clonedEntryWithoutId.status = 'Unpublished'
      clonedEntryWithoutId.url = ''
    }
    const rootId = await add({ entry: clonedEntryWithoutId })
    rootEntry = { ...clonedEntry, id: rootId }
    idMap.set(entry.id, rootId)
  }

  if (!rootEntry) throw new Error('No op')
  return rootEntry
}

export type Resolved = {
  Slot: Record<string, Array<Resolved['Block']>>
  Page: Omit<Page, 'slots'> & { slots: Resolved['Slot'] }
  Block: Omit<Block, 'slots'> & { slots: Resolved['Slot'] }
}

type ResolvedNode = Resolved['Page'] | Resolved['Block']

export async function resolveTree<T extends ResolvedNode['store']>(store: T, id: number) {
  // Fetch the root node
  const rootData = await get({ store, id })
  const resolvedData: ResolvedNode = { ...rootData, slots: {} }

  // If the node has slots, resolve each slot recursively
  if (rootData.slots) {
    const resolvedSlots: Resolved['Slot'] = {}
    // Process each slot category
    for (const [slotKey, slotIds] of Object.entries<Array<Block['id']>>(rootData.slots)) {
      resolvedSlots[slotKey] = await Promise.all(slotIds.map((childId) => resolveTree('blocks', childId)))
    }
    resolvedData.slots = resolvedSlots
  }

  return resolvedData as T extends 'pages' ? Resolved['Page'] : Resolved['Block']
}

// add
export async function add(args: { entry: Omit<Page, 'id'> | Omit<Block, 'id'> | Omit<Template, 'id'> }) {
  await slow()
  error()
  const tx = db.transaction(args.entry.store, 'readwrite')
  const [id] = await Promise.all([tx.store.add(args.entry as Block | Page | Template), tx.done])
  return id
}

// addMany
export async function addMany(args: { entries: Array<Page | Block | Template> }) {
  await slow()
  error()
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
  await slow()
  error()
  const tx = db.transaction(args.entry.store, 'readwrite')
  const [id] = await Promise.all([tx.store.put(args.entry), tx.done])
  return id
}

// updateMany
export async function updateMany(args: { entries: Array<Page | Block | Template> }) {
  await slow()
  error()
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
  await slow()
  const tx = db.transaction(args.entry.store, 'readwrite')
  await Promise.all([tx.store.delete(args.entry.id), tx.done])
}

// removeMany
export async function removeMany(args: { entries: Array<Page | Block | Template> }) {
  await slow()
  error()
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

export function isBlock(args: any): args is Block {
  return args.store === 'blocks'
}

export function isTemplate(args: any): args is Template {
  return args.store === 'templates'
}

export function isPage(args: any): args is Page {
  return args.store === 'pages'
}

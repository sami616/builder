import { type Block, type Experience, db } from './db'
export const experienceBlocksKey = 'experienceRoot'

// get
export async function get(args: { id: Experience['id']; type: 'experiences' }): Promise<Experience>
export async function get(args: { id: Block['id']; type: 'blocks' }): Promise<Block>

export async function get(args: { id: Experience['id'] | Block['id']; type: 'experiences' | 'blocks' }) {
  const tx = db.transaction(args.type, 'readonly')
  const [entry] = await Promise.all([tx.store.get(args.id), tx.done])
  if (!entry) throw new Error('Entry not found')
  return entry
}

// getMany
export async function getMany(args: { type: 'experiences'; sortBy: 'latest' | 'oldest' }): Promise<Experience[]>
export async function getMany(args: { type: 'blocks'; sortBy: 'latest' | 'oldest' }): Promise<Block[]>

export async function getMany(args: { type: 'experiences' | 'blocks'; sortBy: 'latest' | 'oldest' }) {
  const tx = db.transaction(args.type, 'readonly')
  const map = new Map([
    ['latest', 'prev'],
    ['oldest', 'next'],
  ] as const)
  const index = tx.store.index('createdAt')
  const entries = []
  let cursor = await index.openCursor(null, map.get(args.sortBy))
  while (cursor) {
    entries.push(cursor.value), (cursor = await cursor.continue())
  }
  return entries
}

// getTree
export async function getTree({
  entries = [],
  ...args
}: {
  root: { store: 'blocks'; id: Block['id'] } | { store: 'experiences'; id: Experience['id'] }
  entries?: Array<Block | Experience>
}) {
  const entry = args.root.store === 'blocks' ? await get({ id: args.root.id, type: 'blocks' }) : await get({ id: args.root.id, type: 'experiences' })
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
export async function add(args: { entry: Omit<Experience, 'id'> | Omit<Block, 'id'> }) {
  const tx = db.transaction(getStore(args.entry), 'readwrite')
  const [id] = await Promise.all([tx.store.add(args.entry as Block | Experience), tx.done])
  return id
}

// addMany
export async function addMany(args: { entries: Array<Experience | Block> }) {
  const expTx = db.transaction('experiences', 'readwrite')
  const bloTx = db.transaction('blocks', 'readwrite')
  const promises = args.entries.map((entry) => (isBlock(entry) ? bloTx.store.add(entry) : expTx.store.add(entry)))
  const ids = await Promise.all([...promises, expTx.done, bloTx.done])
  return ids.filter(Boolean)
}

// update
export async function update(args: { entry: Experience | Block }) {
  if (isBlock(args.entry)) {
    args.entry
  }
  const tx = db.transaction(getStore(args.entry), 'readwrite')
  const [id] = await Promise.all([tx.store.put(args.entry), tx.done])
  return id
}

// updateMany
export async function updateMany(args: { entries: Array<Experience | Block> }) {
  const expTx = db.transaction('experiences', 'readwrite')
  const bloTx = db.transaction('blocks', 'readwrite')
  const promises = args.entries.map((entry) => (isBlock(entry) ? bloTx.store.put(entry) : expTx.store.put(entry)))
  const ids = await Promise.all([...promises, expTx.done, bloTx.done])
  return ids.filter(Boolean)
}

// remove
export async function remove(args: { entry: Experience | Block }) {
  const tx = db.transaction(getStore(args.entry), 'readwrite')
  await Promise.all([tx.store.delete(args.entry.id), tx.done])
}

// removeMany
export async function removeMany(args: { entries: Array<Experience | Block> }) {
  const expTx = db.transaction('experiences', 'readwrite')
  const bloTx = db.transaction('blocks', 'readwrite')
  const promises = args.entries.map((entry) => (isBlock(entry) ? bloTx.store.delete(entry.id) : expTx.store.delete(entry.id)))
  await Promise.all([...promises, expTx.done, bloTx.done])
}

export function isBlock(args: Omit<Block | Experience, 'id'>): args is Block {
  return 'props' in args
}

export function isExperience(args: Block | Experience): args is Experience {
  return !('props' in args)
}

export function getStore(arg: Omit<Experience, 'id'> | Omit<Block, 'id'>) {
  return isBlock(arg) ? 'blocks' : 'experiences'
}

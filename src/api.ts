import { Block, db, type Experience } from './db'

// function slow(n: number | 'random') {
//   const duration =
//     n === 'random' ? Math.floor(Math.random() * (5000 - 1000 + 1) + 1000) : n
//   return new Promise((resolve) => setTimeout(resolve, duration))
// }

// DB Queries
export async function getExperiences(args: { sortBy: 'latest' | 'oldest' }) {
  const tx = db.transaction('experiences', 'readonly')

  const map = new Map([
    ['latest', 'prev'],
    ['oldest', 'next'],
  ] as const)

  // Get them in date order
  const index = tx.store.index('createdAt')

  const experiences = []

  let cursor = await index.openCursor(null, map.get(args.sortBy))

  while (cursor) {
    experiences.push(cursor.value)
    cursor = await cursor.continue()
  }

  return experiences
}

export async function getBlock(args: { blockId: number }) {
  const tx = db.transaction('blocks', 'readonly')
  const [block] = await Promise.all([tx.store.get(args.blockId), tx.done])
  if (!block) throw new Error('Block not found')
  return block
}

export async function getExperience(args: { experienceId: number }) {
  const tx = db.transaction('experiences', 'readonly')
  const [experience] = await Promise.all([
    tx.store.get(args.experienceId),
    tx.done,
  ])
  if (!experience) throw new Error('Experience not found')
  return experience
}

// DB Mutations

export const experienceBlocksKey = 'experienceRoot'

export async function addExperience(
  experience: Omit<
    Experience,
    'id' | 'updatedAt' | 'createdAt' | 'status' | 'blocks'
  >,
) {
  const tx = db.transaction('experiences', 'readwrite')

  const [id] = await Promise.all([
    tx.store.add({
      ...experience,
      createdAt: new Date(),
      updatedAt: new Date(),
      blocks: { [experienceBlocksKey]: [] },
      status: 'draft',
    } as unknown as Experience),
    tx.done,
  ])
  return id
}

export async function addBlock(
  block: Omit<Block, 'id' | 'updatedAt' | 'createdAt'>,
) {
  const tx = db.transaction('blocks', 'readwrite')

  const [id] = await Promise.all([
    tx.store.add({
      ...block,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as Block),
    tx.done,
  ])
  return id
}

export async function updateBlock(args: { block: Block }) {
  const tx = db.transaction('blocks', 'readwrite')

  const [updatedBlock] = await Promise.all([
    tx.store.put({ ...args.block, updatedAt: new Date() }),
    tx.done,
  ])
  return updatedBlock
}

export async function updateExperience(args: { experience: Experience }) {
  const tx = db.transaction('experiences', 'readwrite')

  const [updatedExperience] = await Promise.all([
    tx.store.put({ ...args.experience, updatedAt: new Date() }),
    tx.done,
  ])
  return updatedExperience
}

export async function deleteExperience(args: { id: Experience['id'] }) {
  const experience = await getExperience({ experienceId: args.id })

  let deletedBlockIds: Array<Block['id']> = []

  for (const blockId of Object.values(experience.blocks[experienceBlocksKey])) {
    // Recursively delete all blocks
    deletedBlockIds = await deleteBlocksRecursivley(blockId)
  }

  const tx = db.transaction('experiences', 'readwrite')
  await Promise.all([tx.store.delete(args.id), tx.done])
  return { experience: args.id, blocks: deletedBlockIds }
}

export async function getBlocksRecursively(
  id: Block['id'],
  deletedIds: Block['id'][] = [],
) {
  const block = await getBlock({ blockId: id })
  const blockKeys = Object.keys(block.blocks)

  // Recursively accumulate all child block IDs
  for (const key of blockKeys) {
    for (const childId of block.blocks[key]) {
      await getBlocksRecursively(childId, deletedIds)
    }
  }

  // Add the current block's ID to the deletedIds array
  deletedIds.push(id)
  return deletedIds
}

export async function deleteBlocksRecursivley(id: Block['id']) {
  const blockIdsToDelete = await getBlocksRecursively(id)
  const tx = db.transaction('blocks', 'readwrite')
  let cursor = await tx.store.openCursor()

  while (cursor) {
    if (blockIdsToDelete.includes(cursor.primaryKey)) {
      await cursor.delete()
    }
    cursor = await cursor.continue() // Move to the next entry
  }

  await tx.done
  return blockIdsToDelete
}

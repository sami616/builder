import { db, type Experience } from './db'

// function slow(n: number) {
//   return new Promise((resolve) => setTimeout(resolve, n))
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
      blocks: [],
      status: 'draft',
    } as unknown as Experience),
    tx.done,
  ])
  return id
}

export async function updateExperience(args: { experience: Experience }) {
  const tx = db.transaction('experiences', 'readwrite')

  const [updatedExperience] = await Promise.all([
    tx.store.put({ ...args.experience, updatedAt: new Date() }),
    tx.done,
  ])
  return updatedExperience
}

export async function deleteExperience(id: Experience['id']) {
  const tx = db.transaction('experiences', 'readwrite')
  await Promise.all([tx.store.delete(id), tx.done])
  return id
}

import { context } from '@repo/editor/'
import { type Block, type Page } from '@repo/editor/db'

export type Resolved = {
  Slot: Record<string, Array<Resolved['Block']>>
  Page: Omit<Page, 'slots'> & { slots: Resolved['Slot'] }
  Block: Omit<Block, 'slots'> & { slots: Resolved['Slot'] }
}

type ResolvedNode = Resolved['Page'] | Resolved['Block']

export async function resolveTree<T extends ResolvedNode['store']>(store: T, id: number) {
  // Fetch the root node
  const rootData = await context.get({ store, id })
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

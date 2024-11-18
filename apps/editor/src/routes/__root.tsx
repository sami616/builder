import { type Context } from '@/main'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { ActiveProvider } from '@/hooks/use-active'
// import { Block, Page } from '@/db'
// import { context } from '@/main'

// type Resolved = {
//   Slot: Record<string, Array<Resolved['Block']>>
//   Page: Omit<Page, 'slots'> & { slots: Resolved['Slot'] }
//   Block: Omit<Block, 'slots'> & { slots: Resolved['Slot'] }
// }
//
// type ResolvedNode = Resolved['Page'] | Resolved['Block']

// async function resolveTree<T extends ResolvedNode['store']>(store: T, id: number) {
//   // Fetch the root node
//   const rootData = await context.get({ store, id })
//   const resolvedData: ResolvedNode = { ...rootData, slots: {} }
//
//   // If the node has slots, resolve each slot recursively
//   if (rootData.slots) {
//     const resolvedSlots: Resolved['Slot'] = {}
//     // Process each slot category
//     for (const [slotKey, slotIds] of Object.entries(rootData.slots)) {
//       resolvedSlots[slotKey] = await Promise.all(slotIds.map((childId) => resolveTree('blocks', childId)))
//     }
//     resolvedData.slots = resolvedSlots
//   }
//
//   return resolvedData as T extends 'pages' ? Resolved['Page'] : Resolved['Block']
// }

export const Route = createRootRouteWithContext<Context>()({
  component: () => (
    <ActiveProvider>
      <Outlet />
    </ActiveProvider>
  ),
  loader: async () => {
    // Usage example
    // const fullTree = await resolveTree('pages', 7)
    // console.log(fullTree)
  },
})

import { useMutation } from '@tanstack/react-query'
import { type ComponentProps } from 'react'
import { BlockItem } from '../editor-components/BlockItem'
import { useRouteContext } from '@tanstack/react-router'

export function useDuplicateBlock() {
  const context = useRouteContext({ from: '/experiences/$id' })

  const duplicateBlock = useMutation({
    mutationFn: async (args: {
      index: number
      root: Parameters<typeof context.getTree>[0]['root']
      parent: ComponentProps<typeof BlockItem>['parent']
    }) => {
      const idMap = new Map()
      let rootId = null
      const entries = await context.getTree({ root: args.root })

      for (const entry of entries) {
        const clonedEntry = structuredClone(entry)

        const date = new Date()
        clonedEntry.createdAt = date
        clonedEntry.updatedAt = date

        for (var slot in entry.slots) {
          clonedEntry.slots[slot] = entry.slots[slot].map((id) => idMap.get(id))
        }

        const { id, ...clonedEntryWithoutId } = clonedEntry
        rootId = await context.add({ entry: clonedEntryWithoutId })
        idMap.set(entry.id, rootId)
      }

      if (!rootId) throw new Error('no op')

      const clonedParent = structuredClone(args.parent.node)
      clonedParent.slots[args.parent.slot].splice(args.index + 1, 0, rootId)
      await context.update({ entry: clonedParent })
      return { store: context.getStore(clonedParent), id: args.parent.node.id }
    },
    onSuccess: async ({ store, id }) => {
      context.queryClient.invalidateQueries({ queryKey: [store, id] })
    },
  })
  return duplicateBlock
}

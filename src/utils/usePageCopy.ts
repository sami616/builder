import { useMutation } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'

export function usePageCopy() {
  const context = useRouteContext({ from: '/experiences/' })
  return useMutation({
    mutationFn: async (args: { root: Parameters<typeof context.getTree>[0]['root'] }) => {
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
    },
    onSuccess: async () => {
      context.queryClient.invalidateQueries({ queryKey: ['experiences'] })
    },
  })
}

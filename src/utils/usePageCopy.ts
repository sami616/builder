import { Page } from '@/db'
import { useToast } from '@/hooks/use-toast'
import { useMutation } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'

export function usePageCopy() {
  const context = useRouteContext({ from: '/pages/' })
  const { toast } = useToast()
  return {
    pageCopy: useMutation({
      mutationKey: ['page', 'copy'],
      mutationFn: async (args: { id: Page['id'] }) => {
        const idMap = new Map()
        let rootId = null
        const entries = await context.getTree({ root: { store: 'pages', id: args.id } })

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
        context.queryClient.invalidateQueries({ queryKey: ['pages'] })
        toast({ description: 'Page copied' })
      },
      onError: (e) => {
        toast({ title: 'Page copy failed', variant: 'destructive', description: e?.message })
      },
    }),
  }
}

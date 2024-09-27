import { Page } from '@/db'
import { useToast } from '@/hooks/use-toast'
import { useMutation } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'

export function usePageCopyMany() {
  const context = useRouteContext({ from: '/pages/' })
  const { toast } = useToast()
  return {
    pageCopyMany: useMutation({
      mutationKey: ['page', 'copy'],
      mutationFn: async (args: { ids: Array<Page['id']> }) => {
        const idMap = new Map()
        let rootId = null

        for (const id of args.ids) {
          const entries = await context.getTree({ root: { store: 'pages', id } })
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
        }
      },
      onSuccess: async () => {
        context.queryClient.invalidateQueries({ queryKey: ['pages'] })
        toast({ description: 'Pages copied' })
      },
      onError: (e) => {
        toast({ title: 'Pages copy failed', variant: 'destructive', description: e?.message })
      },
    }),
  }
}

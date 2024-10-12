import { isPage } from '@/api'
import { Page } from '@/db'
import { useMutation } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import { generateSlug } from 'random-word-slugs'
import { toast } from 'sonner'

type Args = { ids: Array<Page['id']> }

export function usePageCopyMany() {
  const context = useRouteContext({ from: '/pages/' })
  const mutation = useMutation({
    mutationKey: ['page', 'copy'],
    mutationFn: async (args: Args) => {
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
          if (isPage(clonedEntryWithoutId)) {
            clonedEntryWithoutId.slug = generateSlug()
          }
          rootId = await context.add({ entry: clonedEntryWithoutId })
          idMap.set(entry.id, rootId)
        }
      }
    },
    onSuccess: async () => {
      context.queryClient.invalidateQueries({ queryKey: ['pages'] })
    },
  })

  async function pageCopyMany(args: Args) {
    const promise = mutation.mutateAsync(args)
    toast.promise(promise, {
      loading: 'Duplicating pages...',
      success: 'Duplicated pages',
      error: 'Duplicating pages failed',
    })
    return promise
  }

  return { pageCopyMany }
}

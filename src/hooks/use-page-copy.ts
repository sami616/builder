import { Page } from '@/db'
import { toast } from 'sonner'
import { useMutation } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import { isPage } from '@/api'
import { generateSlug } from 'random-word-slugs'

type Args = { id: Page['id'] }

export function usePageCopy() {
  const context = useRouteContext({ from: '/pages/' })
  const mutation = useMutation({
    mutationKey: ['page', 'copy'],
    mutationFn: async (args: Args) => {
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
        if (isPage(clonedEntryWithoutId)) {
          clonedEntryWithoutId.slug = generateSlug()
        }
        rootId = await context.add({ entry: clonedEntryWithoutId })
        idMap.set(entry.id, rootId)
      }
    },
    onSuccess: async () => {
      context.queryClient.invalidateQueries({ queryKey: ['pages'] })
    },
  })

  async function pageCopy(args: Args) {
    const promise = mutation.mutateAsync(args)
    toast.promise(promise, {
      loading: 'Duplicating page...',
      success: 'Duplicated page',
      error: 'Duplicating page failed',
    })
    return promise
  }

  return { pageCopy }
}

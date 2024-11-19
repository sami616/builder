import { type ComponentProps } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { Page, type Block } from '#db.ts'
import { BlockItem } from '#components/editor/block-item.tsx'
import { toast } from 'sonner'
import { useActive } from '#hooks/use-active.tsx'
import { isPage } from '#api.ts'
import { context } from '#main.tsx'

type Args = { id: Block['id']; index: number; parent: ComponentProps<typeof BlockItem>['parent'] }

export function useBlockDelete() {
  const params = useParams({ strict: false })
  const { setActive } = useActive()

  const mutation = useMutation({
    mutationKey: ['canvas', 'block', 'delete'],
    mutationFn: async (args: Args) => {
      const date = new Date()
      const entries = await context.getTree({ root: { id: args.id, store: 'blocks' } })
      await context.removeMany({ entries })
      const clonedParentNode = structuredClone(args.parent.node)
      clonedParentNode.slots[args.parent.slot].splice(args.index, 1)
      clonedParentNode.updatedAt = date

      if (!isPage(clonedParentNode) && params.id) {
        const page = context.queryClient.getQueryData<Page>(['pages', Number(params.id)])
        if (page) await context.update({ entry: { ...page, updatedAt: date } })
      }

      return context.update({ entry: clonedParentNode })
    },
    onSuccess: async (_data, vars) => {
      context.queryClient.invalidateQueries({ queryKey: [vars.parent.node.store, vars.parent.node.id] })
      if (!isPage(vars.parent.node)) {
        context.queryClient.invalidateQueries({ queryKey: ['pages'] })
      }
      setActive({ store: 'none', items: [] })
    },
  })

  async function blockDelete(args: Args) {
    const promise = mutation.mutateAsync(args)
    toast.promise(promise, {
      loading: 'Deleting layer...',
      success: 'Deleted layer',
      error: 'Deleting layer failed',
    })
    return promise
  }

  return { blockDelete }
}

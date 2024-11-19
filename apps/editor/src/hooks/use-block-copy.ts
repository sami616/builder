import { useMutation } from '@tanstack/react-query'
import { type ComponentProps } from 'react'
import { BlockItem } from '#components/editor/block-item.tsx'
import { useParams } from '@tanstack/react-router'
import { Block, Page } from '#db.ts'
import { toast } from 'sonner'
import { isPage } from '#api.ts'
import { context } from '#main.tsx'

type Args = { index: number; id: Block['id']; parent: ComponentProps<typeof BlockItem>['parent'] }

export function useBlockCopy() {
  const params = useParams({ strict: false })

  const mutation = useMutation({
    mutationKey: ['canvas', 'block', 'copy'],
    mutationFn: async (args: Args) => {
      const date = new Date()
      const tree = await context.getTree({ root: { store: 'blocks', id: args.id } })
      const rootEntry = await context.duplicateTree({ tree })
      const clonedParentNode = structuredClone(args.parent.node)
      clonedParentNode.slots[args.parent.slot].splice(args.index + 1, 0, rootEntry.id)
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
    },
  })

  async function blockCopy(args: Args) {
    const promise = mutation.mutateAsync(args)
    toast.promise(promise, {
      loading: 'Duplicating layer...',
      success: 'Duplicated layer',
      error: 'Duplicating layer failed',
    })
    return promise
  }

  return { blockCopy }
}

import { useMutation } from '@tanstack/react-query'
import { duplicateTree, getTree, isPage } from '@/api'
import { useParams, useRouteContext } from '@tanstack/react-router'
import { DragData } from '@/hooks/use-drag'
import { Edge } from '@/hooks/use-drop'
import { Block, Page } from '@/db'
import { toast } from 'sonner'

type Args = {
  source: DragData['template']
  target: {
    parent: { slot: string; node: Page | Block }
    index?: number
    edge: Edge
  }
}

export function useTemplateApply() {
  const context = useRouteContext({ from: '/_layout/pages/$id/' })
  const params = useParams({ from: '/_layout/pages/$id/' })
  const mutation = useMutation({
    mutationKey: ['canvas', 'template', 'apply'],
    mutationFn: async (args: Args) => {
      const date = new Date()
      const clonedParentNode = structuredClone(args.target.parent.node)
      const tree = await getTree({ root: { id: args.source.node.slots.root[0], store: 'blocks' } })
      const rootEntry = await duplicateTree({ tree })
      const addSlot = args.target.parent.slot
      if (args.target.index !== undefined && args.target.edge) {
        let addIndex = args.target.index
        let { edge } = args.target
        if (edge === 'bottom') addIndex += 1
        clonedParentNode.slots[addSlot].splice(addIndex, 0, rootEntry.id)
      } else {
        clonedParentNode.slots[addSlot].push(rootEntry.id)
      }

      clonedParentNode.updatedAt = date

      if (!isPage(clonedParentNode)) {
        const page = context.queryClient.getQueryData<Page>(['pages', Number(params.id)])
        if (page) await context.update({ entry: { ...page, updatedAt: date } })
      }

      return context.update({ entry: clonedParentNode })
    },
    onSuccess: (data, vars) => {
      context.queryClient.invalidateQueries({ queryKey: [vars.target.parent.node.store, data] })
      if (!isPage(vars.target.parent.node)) {
        context.queryClient.invalidateQueries({ queryKey: ['pages'] })
      }
    },
  })

  async function templateApply(args: Args) {
    const promise = mutation.mutateAsync(args)
    toast.promise(promise, {
      loading: 'Applying template...',
      success: 'Applied template',
      error: 'Applying template failed',
    })
    return promise
  }

  return { templateApply }
}

import { useMutation } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import { useRouteContext } from '@tanstack/react-router'
import { Block, db } from '@/db'
import { DragData } from '@/hooks/use-drag'
import { Edge } from '@/hooks/use-drop'
import { getMany } from '@/api'

export function useTemplateAdd() {
  const context = useRouteContext({ from: '/pages/$id' })
  const { toast } = useToast()
  return {
    templateAdd: useMutation({
      mutationKey: ['canvas', 'template', 'add'],
      mutationFn: async (args: {
        source: DragData['block']
        target?: {
          index: number
          edge: Edge
        }
      }) => {
        const tree = await context.getTree({ root: { store: 'blocks', id: args.source.node.id } })
        const rootEntry = await context.duplicateTree({ tree })

        const date = new Date()
        const template = {
          name: args.source.node.name,
          createdAt: date,
          updatedAt: date,
          rootNode: rootEntry as Block,
          slots: { root: [rootEntry.id] },
        }

        if (args.target?.index !== undefined && args.target.edge) {
          const tx = db.transaction('templates', 'readwrite')
          let addIndex = args.target.index
          let { edge } = args.target
          if (edge === 'bottom') addIndex += 1
          const index = tx.store.index('order')
          const range = IDBKeyRange.lowerBound(addIndex)
          let cursor = await index.openCursor(range, 'prev')

          while (cursor) {
            const item = cursor.value
            item.order += 1
            await cursor.update(item)
            cursor = await cursor.continue()
          }
          return context.add({ entry: { ...template, store: 'templates', order: addIndex } })
        }

        const templates = await getMany({ store: 'templates', sortBy: ['order', 'descending'] })
        return context.add({ entry: { ...template, store: 'templates', order: templates.length + 1 } })
      },
      onSuccess: () => {
        context.queryClient.invalidateQueries({ queryKey: ['templates'] })
        toast({ description: 'Template created' })
      },
      onError: (e) => {
        toast({ title: 'Template creation failed', variant: 'destructive', description: e?.message })
      },
    }),
  }
}

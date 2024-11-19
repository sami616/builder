import { useMutation } from '@tanstack/react-query'
import { Block, db } from '#db.ts'
import { DragData } from '#hooks/use-drag.ts'
import { Edge } from '#hooks/use-drop.ts'
import { getMany } from '#api.ts'
import { toast } from 'sonner'
import { context } from '#main.tsx'

type Args = {
  name?: string
  source: DragData['block']
  target?: {
    index: number
    edge: Edge
  }
}

export function useTemplateAdd() {
  const mutation = useMutation({
    mutationKey: ['canvas', 'template', 'add'],
    mutationFn: async (args: Args) => {
      const tree = await context.getTree({ root: { store: 'blocks', id: args.source.node.id } })
      const rootEntry = await context.duplicateTree({ tree })

      const date = new Date()
      const template = {
        name: args.name ?? args.source.node.name,
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

      return context.add({ entry: { ...template, store: 'templates', order: templates.length } })
    },
    onSuccess: () => {
      context.queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })

  async function templateAdd(args: Args) {
    const promise = mutation.mutateAsync(args)
    toast.promise(promise, {
      loading: 'Adding template...',
      success: 'Added template',
      error: 'Adding template failed',
    })
    return promise
  }
  return { templateAdd }
}

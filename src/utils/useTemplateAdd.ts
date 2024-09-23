import { useMutation } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import { Block, db } from '../db'
import { DragData } from './useDrag'
import { Edge } from './useDrop'

export function useTemplateAdd() {
  const context = useRouteContext({ from: '/pages/$id' })
  return {
    templateAdd: useMutation({
      mutationKey: ['canvas', 'template', 'add'],
      mutationFn: async (args: {
        source: DragData['block']
        target: {
          index?: number
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
          // Todo: can this be properly inferred based on the store prop we pass to gerTree?
          rootNode: rootEntry as Block,
          slots: { root: [rootEntry.id] },
        }

        if (args.target.index !== undefined && args.target.edge) {
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

        return context.add({ entry: { ...template, store: 'templates', order: 0 } })
      },
      onSuccess: () => {
        context.queryClient.invalidateQueries({ queryKey: ['templates'] })
      },
    }),
  }
}

import { useMutation } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import { DragDrop, isDragDrop } from './useDragDrop'
import { Drop } from './useDrop'
import { db } from '../db'

export function useTemplateAdd() {
  const context = useRouteContext({ from: '/experiences/$id' })
  return useMutation({
    mutationFn: async (args: { source: DragDrop['Block']['Source']; target: Drop['Template']['Target'] | DragDrop['Template']['Target'] }) => {
      const tree = await context.getTree({ root: { store: 'blocks', id: args.source.node.id } })
      const rootEntry = await context.duplicateTree({ tree })
      const tx = db.transaction('templates', 'readwrite')

      const date = new Date()
      const template = {
        name: args.source.node.name,
        createdAt: date,
        updatedAt: date,
        slots: { root: [rootEntry.id] },
      }

      if (isDragDrop.template.target(args.target)) {
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
      } else {
        return context.add({ entry: { ...template, store: 'templates', order: 0 } })
      }
    },
    onSuccess: () => {
      context.queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })
}

import { useMutation } from '@tanstack/react-query'
import { db, Template } from '@/db'
import { useRouteContext } from '@tanstack/react-router'
import { DragData } from '@/hooks/useDrag'
import { Edge } from '@/hooks/useDrop'

export function useTemplateReorder() {
  const context = useRouteContext({ from: '/pages/$id' })
  return {
    templateReorder: useMutation({
      mutationKey: ['canvas', 'template', 'reorder'],
      mutationFn: async (args: { source: DragData['template']; target: { index: number; node: Template; edge: Edge } }) => {
        const tx = db.transaction('templates', 'readwrite')
        const clonedSource = structuredClone(args.source.node)
        const { edge } = args.target
        let addIndex = args.target.index
        let removeIndex = args.source.index
        let range: IDBKeyRange
        let direction: IDBCursorDirection
        const index = tx.store.index('order')
        let op: '+' | '-'

        function shiftCursor(val: number, op: '+' | '-') {
          return op === '+' ? val + 1 : val - 1
        }

        if (removeIndex < addIndex) {
          if (edge === 'top') addIndex -= 1
          range = IDBKeyRange.bound(removeIndex + 1, addIndex)
          direction = 'next'
          op = '-'
        } else {
          if (edge === 'bottom') addIndex += 1
          range = IDBKeyRange.bound(addIndex, removeIndex - 1)
          direction = 'prev'
          op = '+'
        }

        let cursor = await index.openCursor(range, direction)
        while (cursor) {
          const item = cursor.value
          item.order = shiftCursor(item.order, op)
          await cursor.update(item)
          cursor = await cursor.continue()
        }

        clonedSource.order = addIndex
        return tx.store.put(clonedSource)
      },
      onSuccess: () => {
        context.queryClient.invalidateQueries({ queryKey: ['templates'] })
      },
    }),
  }
}

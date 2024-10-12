import { useMutation } from '@tanstack/react-query'
import { db, Template } from '@/db'
import { useRouteContext } from '@tanstack/react-router'
import { DragData } from '@/hooks/use-drag'
import { Edge } from '@/hooks/use-drop'
import { toast } from 'sonner'

type Args = {
  source: DragData['template']
  target: { index: number; node: Template; edge: Edge }
}

export function useTemplateReorder() {
  const context = useRouteContext({ from: '/pages/$id' })
  const mutation = useMutation({
    mutationKey: ['canvas', 'template', 'reorder'],
    mutationFn: async (args: Args) => {
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
  })

  async function templateReorder(args: Args) {
    const promise = mutation.mutateAsync(args)
    toast.promise(promise, {
      loading: 'Reordering template...',
      success: 'Reordered template',
      error: 'Reordering template failed',
    })
    return promise
  }

  return { templateReorder }
}

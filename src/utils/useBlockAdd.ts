import { useMutation } from '@tanstack/react-query'
import { ComponentItemSource } from '../editor-components/ComponentItem'
import { DragDrop, isDragDrop } from './useDragDrop'
import { Drop } from './useDrop'
import { useRouteContext } from '@tanstack/react-router'

export function useBlockAdd() {
  const context = useRouteContext({ from: '/experiences/$id' })

  return useMutation({
    mutationFn: async (args: { source: ComponentItemSource; target: DragDrop['Block']['Target'] | Drop['Block']['Target'] }) => {
      const clonedParentNode = structuredClone(args.target.parent.node)
      const configItem = context.config[args.source.type]
      const propKeys = Object.keys(configItem.props)
      const slotKeys = Object.keys(configItem.slots)
      const slot = args.target.parent.slot

      const defaultProps = propKeys.reduce((props, propKey) => {
        return { ...props, [propKey]: configItem.props[propKey].default }
      }, {})

      const defaultSlots = slotKeys.reduce((blocks, slot) => {
        return { ...blocks, [slot]: configItem.slots[slot].default }
      }, {})

      const date = new Date()
      const blockId = await context.add({
        entry: {
          store: 'blocks',
          type: args.source.type,
          name: configItem.name,
          props: defaultProps,
          slots: defaultSlots,
          createdAt: date,
          updatedAt: date,
        },
      })

      // Add new item
      if (isDragDrop.block.target(args.target)) {
        let addIndex = args.target.index
        let { edge } = args.target
        if (edge === 'bottom') addIndex += 1
        clonedParentNode.slots[slot].splice(addIndex, 0, blockId)
      } else {
        clonedParentNode.slots[slot].push(blockId)
      }

      return context.update({ entry: clonedParentNode })
    },
    onSuccess: (data, vars) => {
      context.queryClient.invalidateQueries({ queryKey: [vars.target.parent.node.store, data] })
    },
  })
}

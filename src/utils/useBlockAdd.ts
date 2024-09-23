import { useMutation } from '@tanstack/react-query'
import { type Edge } from './useDrop'
import { useRouteContext } from '@tanstack/react-router'
import { type Block, type Page } from '../db'
import { DragData } from './useDrag'

export function useBlockAdd() {
  const context = useRouteContext({ from: '/pages/$id' })
  return {
    blockAdd: useMutation({
      mutationKey: ['canvas', 'block', 'add'],
      mutationFn: async (args: {
        source: DragData['component']
        target: {
          parent: { slot: string; node: Page | Block }
          index?: number
          edge: Edge
        }
      }) => {
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

        if (args.target.index !== undefined && args.target.edge) {
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
    }),
  }
}

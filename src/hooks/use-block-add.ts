import { useMutation } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import { type Edge } from '@/hooks/use-drop'
import { useRouteContext } from '@tanstack/react-router'
import { type Block, type Page } from '@/db'
import { DragData } from '@/hooks/use-drag'

export function useBlockAdd() {
  const context = useRouteContext({ from: '/pages/$id' })
  const { toast } = useToast()
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
        const slot = args.target.parent.slot

        let defaultProps: Record<string, any> = {}

        if (configItem.props) {
          const propKeys = Object.keys(configItem.props)
          defaultProps = propKeys.reduce((props, propKey) => {
            return { ...props, [propKey]: configItem.props?.[propKey].default }
          }, {})
        }

        let defaultSlots: Record<string, Array<Block['id']>> = {}

        if (configItem.slots) {
          const slotKeys = Object.keys(configItem.slots)
          defaultSlots = slotKeys.reduce((blocks, slot) => {
            return { ...blocks, [slot]: configItem.slots?.[slot].default }
          }, {})
        }

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
        toast({ description: 'Layer added' })
      },
      onError: (e) => {
        toast({ title: 'Layer adding failed', variant: 'destructive', description: e?.message })
      },
    }),
  }
}

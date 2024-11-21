import { is, type DBStores, type Config } from '@repo/lib'
import { type DragData } from '#hooks/use-drag.ts'
import { type Edge } from '#hooks/use-drop.ts'
import { context } from '#main.tsx'
import { useMutation } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { toast } from 'sonner'

type Args = {
  name?: string
  source: DragData['component']
  target: {
    parent: { slot: string; node: DBStores['Page'] | DBStores['Block'] }
    index?: number
    edge: Edge
  }
}

export function useBlockAdd() {
  const params = useParams({ strict: false })

  const mutation = useMutation({
    mutationKey: ['canvas', 'block', 'add'],
    mutationFn: async (args: Args) => {
      const clonedParentNode = structuredClone(args.target.parent.node)
      const configItem = context.config[args.source.type]
      const slot = args.target.parent.slot

      function getDefaultProps(props?: Config[keyof Config]['props'], defaultProps: { [key: string]: any } = {}) {
        if (!props) return defaultProps
        props.forEach((prop) => {
          if (prop.type === 'collapsible' || prop.type === 'grid') {
            getDefaultProps(prop.props, defaultProps)
          } else {
            defaultProps[prop.id] = prop.default
          }
        })
        return defaultProps
      }

      const defaultProps = getDefaultProps(configItem.props)

      let defaultSlots: Record<string, Array<DBStores['Block']['id']>> = {}

      if (configItem.slots) {
        const slotKeys = Object.keys(configItem.slots)
        defaultSlots = slotKeys.reduce((blocks, slot) => {
          return { ...blocks, [slot]: configItem.slots?.[slot].default ?? [] }
        }, {})
      }

      const date = new Date()
      const id = await context.add({
        entry: {
          store: 'blocks',
          type: args.source.type,
          name: args.name ?? configItem.name,
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
        clonedParentNode.slots[slot].splice(addIndex, 0, id)
      } else {
        clonedParentNode.slots[slot].push(id)
      }

      clonedParentNode.updatedAt = date

      if (!is.page(clonedParentNode) && params.id) {
        const page = context.queryClient.getQueryData<DBStores['Page']>(['pages', Number(params.id)])
        if (page) await context.update({ entry: { ...page, updatedAt: date } })
      }

      return context.update({ entry: clonedParentNode })
    },
    onSuccess: (data, vars) => {
      context.queryClient.invalidateQueries({ queryKey: [vars.target.parent.node.store, data] })
      if (!is.page(vars.target.parent.node)) {
        context.queryClient.invalidateQueries({ queryKey: ['pages'] })
      }
    },
  })

  async function blockAdd(args: Args) {
    const promise = mutation.mutateAsync(args)
    toast.promise(promise, { loading: 'Adding layer...', success: 'Added layer', error: 'Layer adding failed' })
    return promise
  }
  return { blockAdd, mutation }
}

import { useMutation } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import { useBlockGet } from '@/hooks/useBlockGet'
import { config, PropTypes } from '@/main'

export function PropsPanel(props: { activeBlockId: number; setActiveBlockId: (id: number | undefined) => void }) {
  const context = useRouteContext({ from: '/pages/$id' })
  const { blockGet } = useBlockGet({ id: props.activeBlockId })

  const updateBlockProps = useMutation({
    mutationFn: context.update,
    mutationKey: ['block', 'update', 'props', blockGet.data.id],
    onError: (err, _data) => {
      console.error(err)
    },
    onSettled: async (id) => {
      await context.queryClient.invalidateQueries({
        queryKey: ['blocks', id],
      })
    },
  })

  // const AB = updateBlock.isPending ? updateBlock.variables.entry : blockGet.data

  const block = blockGet.data
  const configItem = config[block.type]
  const configItemProps = configItem?.props

  function renderInput(type: PropTypes, key: string) {
    const defaultValue = block.props?.[key]
    switch (type) {
      case 'string': {
        return (
          <input
            onChange={(e) => {
              if (e.target.value.trim() === '') {
                updateBlockProps.mutate({ entry: { ...block, props: { ...block.props, [key]: undefined } } })
              } else {
                updateBlockProps.mutate({ entry: { ...block, props: { ...block.props, [key]: e.target.value } } })
              }
            }}
            defaultValue={defaultValue}
            type="text"
          />
        )
      }
      case 'number': {
        return <input defaultValue={defaultValue} type="number" />
      }
    }
  }

  return (
    <div data-component="PropsPanel">
      <button onClick={() => props.setActiveBlockId(undefined)}>Close</button>
      {<pre>{JSON.stringify(block.props, null, 2)}</pre>}

      {configItemProps &&
        Object.keys(configItemProps).map((key) => (
          <div>
            <label>{configItemProps?.[key].name}</label>
            {renderInput(configItemProps?.[key].type, key)}
          </div>
        ))}
    </div>
  )
}

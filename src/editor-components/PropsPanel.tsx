import { useMutation } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import { useBlockGet } from '../utils/useBlockGet'

export function PropsPanel(props: { activeBlockId: number; setActiveBlockId: (id: number | undefined) => void }) {
  const context = useRouteContext({ from: '/pages/$id' })
  const { blockGet } = useBlockGet({ id: props.activeBlockId })

  const updateBlock = useMutation({
    mutationFn: context.update,
    mutationKey: ['updateBlock', blockGet.data.id],
    onError: (err, _data) => {
      // Todo: show some kind of notification error
      console.error(err)
    },
    onSettled: async (id) => {
      await context.queryClient.invalidateQueries({
        queryKey: ['blocks', id],
      })
    },
  })

  const AB = updateBlock.isPending ? updateBlock.variables.entry : blockGet.data

  return (
    <div data-component="PropsPanel">
      <button onClick={() => props.setActiveBlockId(undefined)}>Close</button>
      {<pre>{JSON.stringify(AB, null, 2)}</pre>}
      {/*
        <input
        type="text"
        onChange={(e) => {
          activeBlock.props.children = e.target.value
          updateBlock.mutate({ block: activeBlockCopy })
        }}
        value={AB?.props.children}
      />
          */}
    </div>
  )
}

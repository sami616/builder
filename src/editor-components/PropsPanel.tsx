import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import './PropsPanel.css'

export function PropsPanel(props: { activeBlockId: number; setActiveBlockId: (id: number | undefined) => void }) {
  const context = useRouteContext({ from: '/experiences/$id' })

  const { data: activeBlock } = useSuspenseQuery({
    queryKey: ['blocks', props.activeBlockId],
    queryFn: () => context.get({ id: props.activeBlockId, store: 'blocks' }),
  })

  const updateBlock = useMutation({
    mutationFn: context.update,
    mutationKey: ['updateBlock', activeBlock.id],
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

  const AB = updateBlock.isPending ? updateBlock.variables.entry : activeBlock

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

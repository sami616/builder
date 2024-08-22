import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import './PropsPanel.css'
import { ChangeEvent, useMemo } from 'react'

export function PropsPanel(props: {
  activeBlockId: number
  setActiveBlockId: (id: number | undefined) => void
}) {
  const context = useRouteContext({ from: '/experiences/$id' })

  const { data: activeBlock } = useSuspenseQuery({
    queryKey: ['blocks', String(props.activeBlockId)],
    queryFn: () => context.getBlock({ blockId: props.activeBlockId }),
  })

  const updateBlock = useMutation({
    mutationFn: context.updateBlock,
    mutationKey: ['updateBlock', String(activeBlock?.id)],
    onError: (err,_data) => {
      // Todo: show some kind of notification error
      console.error(err)},
    onSettled: async () => {
      await context.queryClient.invalidateQueries({
        queryKey: ['blocks', String(activeBlock?.id)],
      })
    },
  })

  const activeBlockCopy = useMemo(
    () => structuredClone(activeBlock),
    [activeBlock],
  )

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    activeBlockCopy.props.children = e.target.value
    updateBlock.mutate({ block: activeBlockCopy })
  }

  const AB = updateBlock.isPending ? updateBlock.variables.block : activeBlock

  return (
    <div data-component="PropsPanel">
      <button onClick={() => props.setActiveBlockId(undefined)}>Close</button>
      {<pre>{JSON.stringify(AB, null, 2)}</pre>}
      <input type="text" onChange={onChange} value={AB?.props.children} />
    </div>
  )
}

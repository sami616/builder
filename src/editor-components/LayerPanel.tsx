import { useSuspenseQuery } from '@tanstack/react-query'
import { type Block, type Experience } from '../db'
import './LayerPanel.css'
import { useRouteContext } from '@tanstack/react-router'

function LayerItem(props: { blockId: Block['id'] }) {
  const context = useRouteContext({ from: '/experiences/$id' })
  const query = useSuspenseQuery({
    queryKey: ['blocks', props.blockId],
    queryFn: () => context.getBlock({ blockId: props.blockId }),
  })

  const hasBlocks = Object.keys(query.data.blocks).length > 0

  return (
    <li>
      {query.data.name}
      {hasBlocks &&
        Object.keys(query.data.blocks).map((blockKey) => (
          <ul key={blockKey}>
            <li>{context.config[query.data.type].blocks[blockKey].name}</li>
            <ul>
              {query.data.blocks[blockKey].map((blockId) => (
                <LayerItem blockId={blockId} key={blockId} />
              ))}
            </ul>
          </ul>
        ))}
    </li>
  )
}

export function LayerPanel(props: { experience: Experience }) {
  const blocks = Object.values(props.experience.blocks)[0]
  return (
    <ul data-component="LayerPanel">
      {blocks.map((blockId) => (
        <LayerItem blockId={blockId} key={blockId} />
      ))}
    </ul>
  )
}

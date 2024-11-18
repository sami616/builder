import { useDeferredValue } from 'react'
import { type Block } from '@/db'
import { useBlockGet } from '@/hooks/use-block-get'
import { Missing } from '@/components/editor/missing'
import { context } from '@/main'

export function PreviewBlockItem(props: { id: Block['id'] }) {
  const { blockGet } = useBlockGet({ id: props.id })
  const deferredBlock = useDeferredValue(blockGet.data)

  const nestedBlocks = Object.keys(deferredBlock.slots).reduce<{
    [key: string]: JSX.Element[] | JSX.Element
  }>((acc, slot) => {
    acc[slot] = deferredBlock.slots[slot].map((id) => {
      return <PreviewBlockItem key={id} id={id} />
    })
    return acc
  }, {})

  const Component = context.config[deferredBlock.type]?.component ?? (() => <Missing node={{ type: 'component', name: deferredBlock.type }} />)

  return <Component {...deferredBlock.props} {...nestedBlocks} />
}

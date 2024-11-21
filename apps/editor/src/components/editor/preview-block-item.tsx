import { Missing } from '#components/editor/missing.tsx'
import { type DBStores } from '@repo/lib'
import { useBlockGet } from '#hooks/use-block-get.ts'
import { context } from '#main.tsx'
import { useDeferredValue } from 'react'

export function PreviewBlockItem(props: { id: DBStores['Block']['id'] }) {
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

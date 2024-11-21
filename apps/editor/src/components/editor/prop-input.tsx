import { PropCollapsible } from '#components/editor/prop-collapsible.tsx'
import { PropInputBoolean } from '#components/editor/prop-input-boolean.tsx'
import { PropInputColour } from '#components/editor/prop-input-colour.tsx'
import { PropInputNumber } from '#components/editor/prop-input-number.tsx'
import { PropInputString } from '#components/editor/prop-input-string.tsx'
import { useBlockGet } from '#hooks/use-block-get.ts'
import { type DBStores, type Config, ConfigProps } from '@repo/lib'
import { useDeferredValue } from 'react'
import { PropGrid } from './prop-grid'

export function PropInput(props: {
  activeBlockId: DBStores['Block']['id']
  field: ConfigProps[keyof ConfigProps]
  configItemProps: Config[keyof Config]['props']
}) {
  const { blockGet } = useBlockGet({ id: props.activeBlockId })
  const deferredBlock = useDeferredValue(blockGet.data)
  switch (props.field.type) {
    case 'string': {
      return <PropInputString key={deferredBlock.id} block={deferredBlock} field={props.field} />
    }
    case 'colour': {
      return <PropInputColour key={deferredBlock.id} block={deferredBlock} field={props.field} />
    }
    case 'number': {
      return <PropInputNumber key={deferredBlock.id} block={deferredBlock} field={props.field} />
    }
    case 'boolean': {
      return <PropInputBoolean key={deferredBlock.id} block={deferredBlock} field={props.field} />
    }
    case 'grid': {
      return <PropGrid key={deferredBlock.id} block={deferredBlock} field={props.field} />
    }
    case 'collapsible': {
      return <PropCollapsible key={deferredBlock.id} block={deferredBlock} field={props.field} />
    }
  }
}

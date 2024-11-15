import { Config, Field } from '@/main'
import { Block } from '@/db'
import { useBlockGet } from '@/hooks/use-block-get'
import { PropInputString } from './prop-input-string'
import { PropInputNumber } from './prop-input-number'
import { PropInputBoolean } from './prop-input-boolean'
import { PropCollapsible } from './prop-collapsible'
import { PropInputColour } from './prop-input-colour'
import { useDeferredValue } from 'react'

export function PropInput(props: { activeBlockId: Block['id']; field: Field; configItemProps: Config[keyof Config]['props'] }) {
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
    case 'collapsible': {
      return <PropCollapsible key={deferredBlock.id} block={deferredBlock} field={props.field} />
    }
  }
}

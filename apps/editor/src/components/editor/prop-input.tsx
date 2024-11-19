import { Config, Field } from '#main.tsx'
import { Block } from '#db.ts'
import { useBlockGet } from '#hooks/use-block-get.ts'
import { PropInputString } from '#components/editor/prop-input-string.tsx'
import { PropInputNumber } from '#components/editor/prop-input-number.tsx'
import { PropInputBoolean } from '#components/editor/prop-input-boolean.tsx'
import { PropCollapsible } from '#components/editor/prop-collapsible.tsx'
import { PropInputColour } from '#components/editor/prop-input-colour.tsx'
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

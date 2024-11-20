import { CollapsibleFieldProps, PropCollapsible } from '#components/editor/prop-collapsible.tsx'
import { PropInputBoolean } from '#components/editor/prop-input-boolean.tsx'
import { PropInputLabel } from '#components/editor/prop-input-label.tsx'
import { PropInputNumber } from '#components/editor/prop-input-number.tsx'
import { PropInputString } from '#components/editor/prop-input-string.tsx'
import { CommonFieldProps, evaluateCondition, Field } from '#components/editor/prop-input.tsx'
import { type Block } from '#db.ts'
import { useId } from 'react'

export type GridFieldProps = CommonFieldProps & {
  type: 'grid'
  props: Array<Field | CollapsibleFieldProps>
  cols?: 1 | 2 | 3
}

export function PropGrid(props: { block: Block; field: GridFieldProps }) {
  const id = useId()
  const hidden = evaluateCondition(props.block.props, props.field.hidden)
  if (hidden) return null

  return (
    <div className="gap-4 grid">
      <PropInputLabel variant="head" field={props.field} for={id} />
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${props.field.cols ?? 1}, 1fr)` }}>
        {props.field.props.map((field) => {
          switch (field.type) {
            case 'string': {
              return <PropInputString key={props.block.id + field.id} block={props.block} field={field} />
            }
            case 'number': {
              return <PropInputNumber key={props.block.id + field.id} block={props.block} field={field} />
            }
            case 'boolean': {
              return <PropInputBoolean key={props.block.id + field.id} block={props.block} field={field} />
            }
            case 'collapsible': {
              return <PropCollapsible key={props.block.id + field.id} block={props.block} field={field} />
            }
          }
        })}
      </div>
    </div>
  )
}

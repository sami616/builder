import { evaluateCondition, GridField } from '@/main'
import { Block } from '@/db'
import { PropInputString } from './prop-input-string'
import { PropInputNumber } from './prop-input-number'
import { PropInputBoolean } from './prop-input-boolean'
import { PropCollapsible } from './prop-collapsible'
import { PropInputLabel } from './prop-input-label'
import { useId } from 'react'

export function PropGrid(props: { block: Block; field: GridField }) {
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

import { evaluateCondition, CollapsibleField } from '@/main'
import { Block } from '@/db'
import { PropInputString } from './prop-input-string'
import { PropInputNumber } from './prop-input-number'
import { PropInputBoolean } from './prop-input-boolean'
import { PropInputLabel } from './prop-input-label'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible'
import { ChevronDown } from 'lucide-react'
import { PropGrid } from './prop-grid'

export function PropCollapsible(props: { block: Block; field: CollapsibleField }) {
  const hidden = evaluateCondition(props.block.props, props.field.hidden)
  if (hidden) return null

  return (
    <Collapsible asChild defaultOpen={props.field.config.defaultOpen}>
      <div className="rounded grid border border-gray-200">
        <CollapsibleTrigger className="bg-gray-100 flex py-2 px-4 gap-2 justify-between items-center">
          <PropInputLabel variant="head" field={props.field} />
          <ChevronDown size={16} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="grid gap-4 p-4">
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
                case 'grid': {
                  return <PropGrid key={props.block.id + field.id} block={props.block} field={field} />
                }
              }
            })}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

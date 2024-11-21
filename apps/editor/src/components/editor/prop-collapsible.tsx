import { PropGrid } from '#components/editor/prop-grid.tsx'
import { PropInputBoolean } from '#components/editor/prop-input-boolean.tsx'
import { PropInputLabel } from '#components/editor/prop-input-label.tsx'
import { PropInputNumber } from '#components/editor/prop-input-number.tsx'
import { PropInputString } from '#components/editor/prop-input-string.tsx'
import { type ConfigProps, evaluateCondition, type DBStores } from '@repo/lib'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible'
import { ChevronDown } from 'lucide-react'
import { PropInputColour } from './prop-input-colour'

export function PropCollapsible(props: { block: DBStores['Block']; field: ConfigProps['Collapsible'] }) {
  const hidden = evaluateCondition(props.block.props, props.field.hidden)
  if (hidden) return null

  return (
    <Collapsible asChild defaultOpen={props.field.config.defaultOpen}>
      <div className="rounded grid border border-gray-200">
        <CollapsibleTrigger className="bg-gray-100 flex py-2 px-4 gap-2 justify-between items-center">
          <PropInputLabel variant="head" field={props.field} />
          <ChevronDown size={16} />
        </CollapsibleTrigger>
        <CollapsibleContent data-collapsible>
          <div className="grid gap-4 p-4">
            {props.field.props?.map((field) => {
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
                case 'colour': {
                  return <PropInputColour key={props.block.id + field.id} block={props.block} field={field} />
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

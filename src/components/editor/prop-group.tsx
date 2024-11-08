import { evaluateCondition, Group } from '@/main'
import { Block } from '@/db'
import { PropInputString } from './prop-input-string'
import { PropInputNumber } from './prop-input-number'
import { PropInputBoolean } from './prop-input-boolean'
import { PropInputLabel } from './prop-input-label'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible'
import { ChevronDown } from 'lucide-react'
import clsx from 'clsx'

export function PropGroup(props: { block: Block; group: Group }) {
  const hidden = evaluateCondition(props.block.props, props.group.hidden)
  if (hidden) return null

  const collapsible = props.group.config?.collapsible
  const defaultOpen = collapsible ? props.group.config?.collapsible.defaultOpen : true
  const border = collapsible ? true : (props.group.config?.border ?? true)

  return (
    <Collapsible asChild defaultOpen={defaultOpen}>
      <div className={clsx(`rounded grid border-gray-200`, border && 'border')}>
        {collapsible ? (
          <CollapsibleTrigger className="bg-gray-100 flex p-4 gap-2 justify-between">
            <PropInputLabel field={props.group} />
            <ChevronDown size={16} />
          </CollapsibleTrigger>
        ) : (
          props.group.name && (
            <div className={border ? 'p-4' : 'py-4'}>
              <PropInputLabel field={props.group} />
            </div>
          )
        )}
        <CollapsibleContent>
          <div className="grid">
            <div style={{ gridTemplateColumns: `repeat(${props.group.config?.cols ?? 1}, 1fr)` }} className={clsx('grid gap-4', border && 'p-4')}>
              {props.group.props.map((field) => {
                switch (field.type) {
                  case 'string': {
                    return <PropInputString block={props.block} field={field} />
                  }
                  case 'number': {
                    return <PropInputNumber block={props.block} field={field} />
                  }
                  case 'boolean': {
                    return <PropInputBoolean block={props.block} field={field} />
                  }
                  case 'group': {
                    return <PropGroup block={props.block} group={field} />
                  }
                }
              })}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

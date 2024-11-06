import { ObjectProp } from '@/main'
import { Block } from '@/db'
import { PropInputString } from './prop-input-string'
import { PropInputNumber } from './prop-input-number'
import { PropInputBoolean } from './prop-input-boolean'

export function PropInputObject(props: { block: Block; propKey: string; prop: ObjectProp }) {
  return (
    <div className="gap-2 grid p-2">
      {Object.keys(props.prop.options).map((key) => {
        const optionProps = props.prop.options[key]

        switch (optionProps.type) {
          case 'string': {
            return <PropInputString key={props.block.id} propKey={key} block={props.block} prop={optionProps} />
          }
          case 'number': {
            return <PropInputNumber key={props.block.id} propKey={key} block={props.block} prop={optionProps} />
          }
          case 'boolean': {
            return <PropInputBoolean key={props.block.id} propKey={key} block={props.block} prop={optionProps} />
          }
          case 'object': {
            return <PropInputObject key={props.block.id} propKey={key} block={props.block} prop={optionProps} />
          }
        }
      })}
    </div>
  )
}

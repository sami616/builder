import { useBlockUpdateProps } from '@/hooks/use-block-update-props'
import { BooleanField } from '@/main'
import { useIsMutating } from '@tanstack/react-query'
import { Block } from '@/db'
import { PropInputLabel } from './prop-input-label'
import { Switch } from '../ui/switch'
import { useId } from 'react'

export function PropInputBoolean(props: { block: Block; field: BooleanField }) {
  const { blockUpdateProps } = useBlockUpdateProps()
  const isCanvasMutating = Boolean(useIsMutating({ mutationKey: ['canvas'] }))
  const id = useId()

  return (
    <div className="gap-2 grid">
      <PropInputLabel field={props.field} for={id} />
      <div className="flex gap-2">
        <Switch
          onCheckedChange={(checked) => {
            blockUpdateProps({ block: props.block, props: { [props.field.id]: checked } })
          }}
          defaultChecked={props.block.props[props.field.id]}
          id={id}
          name={id}
          disabled={isCanvasMutating}
        />
      </div>
    </div>
  )
}

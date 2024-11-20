import { PropInputLabel } from '#components/editor/prop-input-label.tsx'
import { type CommonFieldProps } from '#components/editor/prop-input.tsx'
import { Switch } from '#components/ui/switch.tsx'
import { type Block } from '#db.ts'
import { useBlockUpdateProps } from '#hooks/use-block-update-props.ts'
import { useIsMutating } from '@tanstack/react-query'
import { useId } from 'react'

export type BooleanFieldProps = CommonFieldProps & { type: 'boolean'; default?: boolean }

export function PropInputBoolean(props: { block: Block; field: BooleanFieldProps }) {
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

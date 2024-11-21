import { PropInputLabel } from '#components/editor/prop-input-label.tsx'
import { evaluateCondition, type ConfigProps, type DBStores } from '@repo/lib'
import { Switch } from '#components/ui/switch.tsx'
import { useBlockUpdateProps } from '#hooks/use-block-update-props.ts'
import { useIsMutating } from '@tanstack/react-query'
import { useId } from 'react'

export function PropInputBoolean(props: { block: DBStores['Block']; field: ConfigProps['Boolean'] }) {
  const { blockUpdateProps } = useBlockUpdateProps()
  const isCanvasMutating = Boolean(useIsMutating({ mutationKey: ['canvas'] }))
  const id = useId()

  const hidden = evaluateCondition(props.block.props, props.field.hidden)
  if (hidden) return null

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

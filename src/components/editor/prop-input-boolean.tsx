import { useBlockUpdateProps } from '@/hooks/use-block-update-props'
import { BooleanProp } from '@/main'
import { useIsMutating } from '@tanstack/react-query'
import { Block } from '@/db'
import { PropInputLabel } from './prop-input-label'
import { Switch } from '../ui/switch'

export function PropInputBoolean(props: { block: Block; propKey: string; prop: BooleanProp }) {
  const { blockUpdateProps } = useBlockUpdateProps()
  const isCanvasMutating = Boolean(useIsMutating({ mutationKey: ['canvas'] }))

  return (
    <div className="gap-2 grid p-2">
      <PropInputLabel prop={props.prop} propKey={props.propKey} />
      <div className="flex gap-2">
        <Switch
          onCheckedChange={(checked) => {
            blockUpdateProps({ block: props.block, props: { [props.propKey]: checked } })
          }}
          defaultChecked={props.block.props[props.propKey]}
          id={props.propKey}
          name={props.propKey}
          disabled={isCanvasMutating}
        />
      </div>
    </div>
  )
}

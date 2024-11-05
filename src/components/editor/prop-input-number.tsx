import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Check } from 'lucide-react'
import { useBlockUpdateProps } from '@/hooks/use-block-update-props'
import { NumberProp } from '@/main'
import { useIsMutating } from '@tanstack/react-query'
import { Block } from '@/db'
import { PropInputLabel } from './prop-input-label'

export function PropInputNumber(props: { block: Block; propKey: string; prop: NumberProp }) {
  const { blockUpdateProps } = useBlockUpdateProps()
  const isCanvasMutating = Boolean(useIsMutating({ mutationKey: ['canvas'] }))

  return (
    <form
      className="gap-2 grid p-2"
      onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        blockUpdateProps({ block: props.block, props: { [props.propKey]: formData.get(props.propKey) } })
      }}
    >
      <PropInputLabel prop={props.prop} propKey={props.propKey} />
      <div className="flex gap-2">
        <Input
          id={props.propKey}
          name={props.propKey}
          defaultValue={props.block.props[props.propKey]}
          {...props.prop.config}
          disabled={isCanvasMutating}
          type="number"
        />
        <Button type="submit" disabled={isCanvasMutating} size="icon" variant="ghost">
          <Check size={16} />
        </Button>
      </div>
    </form>
  )
}

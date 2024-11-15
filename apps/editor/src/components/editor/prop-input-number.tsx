import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Check } from 'lucide-react'
import { useBlockUpdateProps } from '@/hooks/use-block-update-props'
import { NumberField } from '@/main'
import { useIsMutating } from '@tanstack/react-query'
import { Block } from '@/db'
import { PropInputLabel } from './prop-input-label'
import { useId } from 'react'

export function PropInputNumber(props: { block: Block; field: NumberField }) {
  const { blockUpdateProps } = useBlockUpdateProps()
  const isCanvasMutating = Boolean(useIsMutating({ mutationKey: ['canvas'] }))
  const id = useId()

  return (
    <form
      className="gap-2 grid"
      onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        blockUpdateProps({ block: props.block, props: { [props.field.id]: Number(formData.get(id)) } })
      }}
    >
      <PropInputLabel field={props.field} for={id} />
      <div className="flex gap-2">
        <Input
          id={id}
          name={id}
          className="bg-white"
          defaultValue={props.block.props[props.field.id]}
          {...props.field.config}
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

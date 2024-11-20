import { PropInputLabel } from '#components/editor/prop-input-label.tsx'
import { type CommonFieldProps } from '#components/editor/prop-input.tsx'
import { Button } from '#components/ui/button.tsx'
import { Input } from '#components/ui/input.tsx'
import { type Block } from '#db.ts'
import { useBlockUpdateProps } from '#hooks/use-block-update-props.ts'
import { useIsMutating } from '@tanstack/react-query'
import { Check } from 'lucide-react'
import { type HTMLInputAutoCompleteAttribute, useId } from 'react'

export type NumberFieldProps = CommonFieldProps & {
  type: 'number'
  config?: { autoComplete?: HTMLInputAutoCompleteAttribute; required?: boolean; min?: number; max?: number; step?: number }
  default?: number
}

export function PropInputNumber(props: { block: Block; field: NumberFieldProps }) {
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

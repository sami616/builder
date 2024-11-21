import { PropInputLabel } from '#components/editor/prop-input-label.tsx'
import { evaluateCondition, type DBStores, type ConfigProps } from '@repo/lib'
import { Button } from '#components/ui/button.tsx'
import { Input } from '#components/ui/input.tsx'
import { useBlockUpdateProps } from '#hooks/use-block-update-props.ts'
import { useIsMutating } from '@tanstack/react-query'
import { Check } from 'lucide-react'
import { useId } from 'react'

export function PropInputNumber(props: { block: DBStores['Block']; field: ConfigProps['Number'] }) {
  const { blockUpdateProps } = useBlockUpdateProps()
  const isCanvasMutating = Boolean(useIsMutating({ mutationKey: ['canvas'] }))
  const id = useId()

  const hidden = evaluateCondition(props.block.props, props.field.hidden)
  if (hidden) return null

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

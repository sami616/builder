import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Check } from 'lucide-react'
import { Select, SelectContent, SelectGroup, SelectItem, SelectValue, SelectTrigger } from '../ui/select'
import { useBlockUpdateProps } from '@/hooks/use-block-update-props'
import { evaluateCondition, StringField } from '@/main'
import { useIsMutating } from '@tanstack/react-query'
import { Block } from '@/db'
import { PropInputLabel } from './prop-input-label'
import { useId } from 'react'

export function PropInputString(props: { block: Block; field: StringField }) {
  const { blockUpdateProps } = useBlockUpdateProps()
  const isCanvasMutating = Boolean(useIsMutating({ mutationKey: ['canvas'] }))
  const { options } = props.field
  const id = useId()

  const hidden = evaluateCondition(props.block.props, props.field.hidden)
  if (hidden) return null

  if (!options) {
    return (
      <form
        className="gap-2 grid"
        onSubmit={(e) => {
          e.preventDefault()
          const formData = new FormData(e.currentTarget)
          blockUpdateProps({ block: props.block, props: { [props.field.id]: formData.get(id) } })
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
            type="text"
          />
          <Button type="submit" disabled={isCanvasMutating} size="icon" variant="ghost">
            <Check size={16} />
          </Button>
        </div>
      </form>
    )
  }

  return (
    <div className="gap-2 grid">
      <PropInputLabel field={props.field} for={id} />
      <div className="flex gap-2">
        <Select
          value={props.block.props[props.field.id]}
          onValueChange={(val) => {
            blockUpdateProps({ block: props.block, props: { [props.field.id]: val } })
          }}
        >
          <SelectTrigger disabled={isCanvasMutating} className="bg-white">
            <SelectValue placeholder="Select" />
          </SelectTrigger>

          <SelectContent id={id}>
            <SelectGroup>
              {options.map((opt) => {
                return (
                  <SelectItem key={opt.name} value={opt.value}>
                    {opt.name}
                  </SelectItem>
                )
              })}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

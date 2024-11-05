import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Check } from 'lucide-react'
import { Select, SelectContent, SelectGroup, SelectItem, SelectValue, SelectTrigger } from '../ui/select'
import { useBlockUpdateProps } from '@/hooks/use-block-update-props'
import { String } from '@/main'
import { useIsMutating } from '@tanstack/react-query'
import { Block } from '@/db'
import { InputLabel } from './props-inputs'

export function PropsInputString(props: { block: Block; propKey: string; prop: String }) {
  const { blockUpdateProps } = useBlockUpdateProps()
  const isCanvasMutating = Boolean(useIsMutating({ mutationKey: ['canvas'] }))

  const { options } = props.prop

  if (!options) {
    return (
      <form
        className="gap-2 grid p-2"
        onSubmit={(e) => {
          e.preventDefault()
          const formData = new FormData(e.currentTarget)
          blockUpdateProps({ block: props.block, props: { [props.propKey]: formData.get(props.propKey) } })
        }}
      >
        <InputLabel prop={props.prop} propKey={props.propKey} />
        <div className="flex gap-2">
          <Input
            id={props.propKey}
            name={props.propKey}
            defaultValue={props.block.props[props.propKey]}
            {...props.prop.config}
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
    <div className="gap-2 grid p-2">
      <InputLabel prop={props.prop} propKey={props.propKey} />
      <div className="flex gap-2">
        <Select
          value={props.block.props[props.propKey]}
          onValueChange={(val) => {
            blockUpdateProps({ block: props.block, props: { [props.propKey]: val } })
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent id={props.propKey}>
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

import { config } from '@/main'
import { SquareDashedMousePointer, X } from 'lucide-react'
import { useActive } from '@/hooks/use-active'
import { PropInput } from './prop-input'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'

export function PropPanel() {
  const { active, setActive } = useActive()
  const activeBlock = active.store === 'blocks' && active.items.length === 1 ? active.items[0] : undefined

  if (!activeBlock) {
    return (
      <div className="flex flex-col gap-2 h-full text-sm justify-center items-center">
        <SquareDashedMousePointer size={40} className="stroke-gray-200" />
        <p>No layer selected</p>
      </div>
    )
  }

  const configItem = config[activeBlock.type]
  const configItemProps = configItem.props ?? []

  return (
    <div data-component="PropsPanel">
      <div className="sticky top-0 bg-white">
        <div className="flex gap-2 justify-between items-center">
          <h4 className="font-medium text-sm p-2">{activeBlock.name} props</h4>
          <Button className="shrink-0" variant="ghost" size="icon" onClick={() => setActive({ store: 'none', items: [] })}>
            <X size={16} />
          </Button>
        </div>
        <Separator />
      </div>

      <div className="p-4 gap-4 grid">
        {configItemProps.map((field) => {
          return <PropInput key={field.id} activeBlockId={activeBlock.id} field={field} configItemProps={configItemProps} />
        })}
      </div>
    </div>
  )
}

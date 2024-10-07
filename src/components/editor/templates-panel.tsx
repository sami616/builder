import { type Template } from '@/db'
import { isDragData } from '@/hooks/use-drag'
import { useTemplateAdd } from '@/hooks/use-template-add'
import { DropZone } from '@/components/editor/drop-zone'
import { TemplateItem } from '@/components/editor/template-item'
import { Active } from '@/routes/pages.$id'
import { Layers2 } from 'lucide-react'

export function TemplatePanel(props: { templates: Template[]; active: Active['State']; setActive: Active['Set'] }) {
  const { templateAdd } = useTemplateAdd()
  if (props.templates.length === 0)
    return (
      <DropZone
        id="templateDrop"
        onDrop={({ source }) => {
          if (isDragData['block'](source.data)) {
            templateAdd.mutate({ source: source.data })
          }
        }}
        disableDrop={({ source, element }) => source.data.id === 'componentItem' && element.id === 'templateDrop'}
        children={
          <>
            <Layers2 size={16} className="opacity-40" />
            Create template
          </>
        }
      />
    )
  return (
    <ul data-component="TemplatePanel">
      {props.templates.map((template, index) => {
        return <TemplateItem active={props.active} setActive={props.setActive} index={index} key={template.id} template={template} />
      })}
    </ul>
  )
}

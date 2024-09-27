import { type Template } from '@/db'
import { isDragData } from '@/hooks/useDrag'
import { useTemplateAdd } from '@/hooks/useTemplateAdd'
import { DropZone } from '@/components/editor/DropZone'
import { TemplateItem } from '@/components/editor/TemplateItem'

export function TemplatePanel(props: { templates: Template[] }) {
  const { templateAdd } = useTemplateAdd()
  if (props.templates.length === 0)
    return (
      <DropZone
        id="templateDrop"
        onDrop={({ source, target }) => {
          if (isDragData['block'](source.data)) {
            templateAdd.mutate({ source: source.data, target: target.data })
          }
        }}
        disableDrop={({ source, element }) => source.data.id === 'componentItem' && element.id === 'templateDrop'}
        label="Create template"
      />
    )
  return (
    <ul data-component="TemplatePanel">
      {props.templates.map((template, index) => {
        return <TemplateItem index={index} key={template.id} template={template} />
      })}
    </ul>
  )
}

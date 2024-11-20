import { DropZone } from '#components/editor/drop-zone.tsx'
import { TemplateItem } from '#components/editor/template-item.tsx'
import { Tree } from '#components/ui/tree.tsx'
import { type Template } from '#db.ts'
import { isDragData } from '#hooks/use-drag.ts'
import { useTemplateAdd } from '#hooks/use-template-add.ts'
import { Layout } from 'lucide-react'

export function TemplatePanel(props: { templates: Template[] }) {
  const { templateAdd } = useTemplateAdd()
  if (props.templates.length === 0)
    return (
      <DropZone
        id="templateDrop"
        onDrop={({ source }) => {
          if (isDragData['block'](source.data)) {
            templateAdd({ source: source.data })
          }
        }}
        disableDrop={({ source }) => isDragData['component'](source.data)}
        label="Drop to create a template"
        icon={Layout}
      />
    )
  return (
    <Tree>
      {props.templates.map((template, index) => {
        return <TemplateItem index={index} key={template.id} template={template} />
      })}
    </Tree>
  )
}

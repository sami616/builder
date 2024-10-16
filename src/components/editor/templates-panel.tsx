import { type Template } from '@/db'
import { isDragData } from '@/hooks/use-drag'
import { useTemplateAdd } from '@/hooks/use-template-add'
import { DropZone } from '@/components/editor/drop-zone'
import { TemplateItem } from '@/components/editor/template-item'
import { Layers2 } from 'lucide-react'
import { Tree } from '../ui/tree'

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
        children={
          <>
            <Layers2 size={16} className="opacity-40" />
            Create template
          </>
        }
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

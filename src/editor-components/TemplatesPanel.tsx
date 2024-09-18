import { Template } from '../db'
import { DropZone } from './DropZone'
import { TemplateItem } from './TemplateItem'
import './TemplatePanel.css'

export function TemplatePanel(props: { templates: Template[]; isCanvasUpdatePending: boolean }) {
  if (props.templates.length === 0)
    return (
      <DropZone
        data={{ id: 'templateDrop' } as const}
        onDrop={({ source, target }) => {
          target.data.id
          // source
        }}
        disableDrop={({ source, element }) => source.data.id === 'componentItem' && element.id === 'templateDrop'}
        label="Create template"
      />
    )
  return (
    <ul data-component="TemplatePanel">
      {props.templates.map((template, index) => {
        return <TemplateItem index={index} key={template.id} template={template} isCanvasUpdatePending={props.isCanvasUpdatePending} />
      })}
    </ul>
  )
}

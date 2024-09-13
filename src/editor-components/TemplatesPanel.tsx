import { Template } from '../db'
import { DropZone } from './DropZone'
import { TemplateItem } from './TemplateItem'
import './TemplatePanel.css'

export function TemplatePanel(props: { templates: Template[]; isCanvasUpdatePending: boolean }) {
  if (props.templates.length === 0) <DropZone data={{ id: 'template' }} label="Create template" />
  return (
    <ul data-component="TemplatePanel">
      {props.templates.map((template) => {
        return <TemplateItem key={template.id} template={template} isCanvasUpdatePending={props.isCanvasUpdatePending} />
      })}
    </ul>
  )
}

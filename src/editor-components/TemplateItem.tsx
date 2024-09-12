import './TemplateItem.css'
import { type Template } from '../db'

export function TemplateItem(props: { template: Template; isCanvasUpdatePending: boolean }) {
  return <li>{props.template.name}</li>
}

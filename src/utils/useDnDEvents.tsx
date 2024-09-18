import { useEffect } from 'react'
import { isDrop } from '../utils/useDrop'
import { isComponentItemSource } from '../editor-components/ComponentItem'
import { isDragDrop } from '../utils/useDragDrop'
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { useTemplateApply } from './useTemplateApply'
import { useTemplateReorder } from './useTemplateReorder'
import { useTemplateAdd } from './useTemplateAdd'
import { useBlockAdd } from './useBlockAdd'
import { useBlockReorder } from './useBlockReorder'
import { useBlockReparent } from './useBlockReparent'

export function useDnDEvents() {
  const templateApply = useTemplateApply()
  const templateReorder = useTemplateReorder()
  const templateAdd = useTemplateAdd()
  const blockAdd = useBlockAdd()
  const blockReorder = useBlockReorder()
  const blockReparent = useBlockReparent()

  useEffect(() => {
    return monitorForElements({
      onDrop: async ({ source, location }) => {
        const [target] = location.current.dropTargets

        if (isDragDrop.block.target(target.data) || isDrop.block.target(target.data)) {
          if (isComponentItemSource(source.data)) {
            blockAdd.mutate({ source: source.data, target: target.data })
          }
          if (isDragDrop.template.source(source.data)) {
            templateApply.mutate({ source: source.data, target: target.data })
          }
          if (isDragDrop.block.source(source.data)) {
            const sameParent =
              source.data.parent.node.id === target.data.parent.node.id && source.data.parent.node.store === target.data.parent.node.store

            if (sameParent) {
              blockReorder.mutate({ source: source.data, target: target.data })
            } else {
              blockReparent.mutate({ source: source.data, target: target.data })
            }
          }
        }

        if (isDragDrop.template.target(target.data)) {
          if (isDragDrop.template.source(source.data)) {
            templateReorder.mutate({ source: source.data, target: target.data })
          }
        }
        if (isDrop.template.target(target.data) || isDragDrop.template.target(target.data)) {
          if (isDragDrop.block.source(source.data)) {
            templateAdd.mutate({ source: source.data, target: target.data })
          }
        }
      },
    })
  }, [])

  const pending =
    blockAdd.isPending ||
    blockReparent.isPending ||
    blockReorder.isPending ||
    templateApply.isPending ||
    templateReorder.isPending ||
    templateAdd.isPending

  return { pending }
}

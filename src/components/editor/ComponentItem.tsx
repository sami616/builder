import { type Page, type Block } from '@/db'
import { Config } from '@/main'
import { useEffect, useRef, useState } from 'react'
import { DragPreview } from '@/components/editor/DragPreview'
import { NestedStructure } from '@/components/editor/ComponentPanel'
import { useDrag } from '@/hooks/useDrag'
import { Tree } from '@/components/ui/tree'
import { Folder, FolderOpen, Component } from 'lucide-react'

export function ComponentItem(props: { page: Page; type: Block['type']; value: NestedStructure | Config[keyof Config] }) {
  const dragRef = useRef<HTMLLIElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const treeRef = useRef<HTMLDetailsElement>(null)
  const { isDraggingSource, dragPreviewContainer } = useDrag({
    dragRef,
    data: {
      id: 'componentItem',
      type: props.type,
    },
  })

  useEffect(() => {
    const detailsElement = treeRef.current

    if (detailsElement) {
      setIsOpen(detailsElement?.open)
      const handleToggle = () => setIsOpen(detailsElement.open)

      // Add event listener to the <details> element
      detailsElement.addEventListener('toggle', handleToggle)

      // Clean up event listener on unmount
      return () => {
        detailsElement.removeEventListener('toggle', handleToggle)
      }
    }
  }, [])

  const isLeaf = typeof props.value === 'object' && 'component' in props.value

  if (!isLeaf) {
    return (
      <Tree
        openIcon={<FolderOpen className="size-4 opacity-40 group-hover:opacity-100" />}
        closedIcon={<Folder className="size-4 opacity-40 group-hover:opacity-100" />}
        summaryProps={{ className: 'group' }}
        label={props.type}
      >
        <>
          {Object.entries(props.value as NestedStructure).map(([key, value]) => (
            <ComponentItem value={value} key={key} type={key as Block['type']} page={props.page} />
          ))}
        </>
      </Tree>
    )
  }

  const style = {
    opacity: isDraggingSource ? 0.5 : 1,
  }

  return (
    <>
      <li className="group p-1 flex gap-2 items-center" data-component="ComponentItem" ref={dragRef} style={style} key={props.type}>
        <Component className="group-hover:opacity-40 size-4 opacity-20" />
        {props.type}
      </li>
      <DragPreview dragPreviewContainer={dragPreviewContainer}>Add {props.type} ➕</DragPreview>
    </>
  )
}

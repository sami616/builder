import { HTMLProps, ReactNode, RefObject, useEffect, useRef, useState } from 'react'

export function Tree(props: {
  label: ReactNode
  openIcon: JSX.Element
  closedIcon: JSX.Element
  children: JSX.Element
  detailsProps?: HTMLProps<HTMLDetailsElement>
  detailsRef?: RefObject<HTMLDetailsElement>
  summaryProps?: HTMLProps<HTMLElement>
  summaryRef?: RefObject<HTMLElement>
}) {
  const treeRef = useRef<HTMLDetailsElement>(null)

  const ref = props.detailsRef ?? treeRef

  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const detailsElement = ref.current

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
  return (
    <details {...props.detailsProps} ref={ref} className={`${props.detailsProps?.className ?? ''}`}>
      <summary ref={props.summaryRef} {...props.summaryProps} className={`${props.summaryProps?.className ?? ''} flex p-1 gap-2 items-center`}>
        {isOpen ? props.openIcon : props.closedIcon}
        {props.label}
      </summary>
      <ul className="ml-2 pl-2 border-l border-gray-200 border-dashed">{props.children}</ul>
    </details>
  )
}

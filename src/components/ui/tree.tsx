import { HTMLProps, ReactNode, RefObject, useEffect, useRef, useState } from 'react'
import { Button } from './button'

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
    <details
      onClick={(e) => e.preventDefault()}
      {...props.detailsProps}
      open={isOpen}
      ref={ref}
      className={`${props.detailsProps?.className ?? ''} text-sm`}
    >
      <summary ref={props.summaryRef} {...props.summaryProps} className={`${props.summaryProps?.className ?? ''} flex p-1 gap-2 items-center`}>
        <button onClick={() => setIsOpen(!isOpen)}>{isOpen ? props.openIcon : props.closedIcon}</button>
        {props.label}
      </summary>
      <ul className="ml-1 pl-1 grid gap-2">{props.children}</ul>
    </details>
  )
}

export function TreeRoot(props: {
  labelTrigger?: boolean
  items: JSX.Element[]
  label: ReactNode
  defaultOpen?: boolean
  openIcon?: JSX.Element
  closedIcon?: JSX.Element
}) {
  const [isOpen, setIsOpen] = useState(props.defaultOpen ?? false)

  const Label = props.labelTrigger ? (
    <button className="group p-2 flex gap-2 items-center" onClick={() => setIsOpen(!isOpen)}>
      {isOpen ? props.openIcon : props.closedIcon}
      {props.label}
    </button>
  ) : (
    <div className="p-2 flex gap-2 items-center">
      <button onClick={() => setIsOpen(!isOpen)}>{isOpen ? props.openIcon : props.closedIcon}</button>
      {props.label}
    </div>
  )
  return (
    <div className="grid text-sm">
      {Label}
      {isOpen && <ul className="ml-2">{props.items}</ul>}
    </div>
  )
}

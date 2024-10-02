import { HTMLProps, ReactNode, RefObject, useEffect, useRef, useState } from 'react'

export function Tree(props: {
  labelTrigger?: boolean
  items: JSX.Element[]
  label: ReactNode
  defaultOpen?: boolean
  openIcon?: JSX.Element
  closedIcon?: JSX.Element
}) {
  const [isOpen, setIsOpen] = useState(props.defaultOpen ?? false)

  const Label = props.labelTrigger ? (
    <button className="group flex gap-2 items-center" onClick={() => setIsOpen(!isOpen)}>
      {isOpen ? props.openIcon : props.closedIcon}
      {props.label}
    </button>
  ) : (
    <div className="group flex gap-2 items-center">
      <button onClick={() => setIsOpen(!isOpen)}>{isOpen ? props.openIcon : props.closedIcon}</button>
      {props.label}
    </div>
  )
  return (
    <div className="grid text-sm p-2 gap-2">
      {Label}
      {isOpen && <ul className="ml-2 border-l">{props.items}</ul>}
    </div>
  )
}

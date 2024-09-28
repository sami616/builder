import { ReactNode, useEffect, useRef, useState } from 'react'

export function Tree(props: { label: ReactNode; openIcon: JSX.Element; closedIcon: JSX.Element; children: JSX.Element }) {
  const treeRef = useRef<HTMLDetailsElement>(null)

  const [isOpen, setIsOpen] = useState(false)

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
  return (
    <details ref={treeRef}>
      <summary className="group p-1 flex gap-2 items-center">
        {isOpen ? props.openIcon : props.closedIcon}
        {props.label}
      </summary>
      {props.children}
    </details>
  )
}

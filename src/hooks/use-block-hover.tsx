import { Block } from '@/db'
import { RefObject, useEffect } from 'react'

export function useBlockHover(blockId: Block['id'], element: RefObject<HTMLElement | null>) {
  useEffect(() => {
    function handleHover(e: CustomEvent) {
      if (element.current) {
        if (e.detail.id === blockId) {
          element.current.classList.add('outline-emerald-500')
        } else {
          element.current.classList.remove('outline-emerald-500')
        }
      }
    }

    // Listen for the custom hover event
    document.addEventListener('canvas-hover', handleHover as (e: Event) => void)

    // Cleanup on unmount
    return () => {
      document.removeEventListener('canvas-hover', handleHover as (e: Event) => void)
    }
  }, [blockId])

  function setHover() {
    const event = new CustomEvent('canvas-hover', { bubbles: true, detail: { id: blockId } })
    element.current?.dispatchEvent(event)
  }
  function removeHover() {
    const event = new CustomEvent('canvas-hover', { bubbles: true, detail: { id: null } })
    element.current?.dispatchEvent(event)
  }

  return { setHover, removeHover }
}

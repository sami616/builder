import { DBStores } from '@repo/lib'
import { type RefObject, useEffect } from 'react'

export function useBlockHover(id: DBStores['Block']['id'], element: RefObject<HTMLElement | null>) {
  useEffect(() => {
    function handleHover(e: CustomEvent) {
      if (element.current) {
        if (e.detail.id === id) {
          element.current.classList.add('outline-emerald-500')
          element.current.dataset.hovered = 'true'
        } else {
          element.current.classList.remove('outline-emerald-500')
          element.current.dataset.hovered = 'false'
        }
      }
    }

    // Listen for the custom hover event
    document.addEventListener('canvas-hover', handleHover as (e: Event) => void)

    // Cleanup on unmount
    return () => {
      document.removeEventListener('canvas-hover', handleHover as (e: Event) => void)
    }
  }, [id])

  function setHover() {
    const event = new CustomEvent('canvas-hover', { bubbles: true, detail: { id } })
    element.current?.dispatchEvent(event)
  }
  function removeHover() {
    const event = new CustomEvent('canvas-hover', { bubbles: true, detail: { id: null } })
    element.current?.dispatchEvent(event)
  }

  return { setHover, removeHover }
}

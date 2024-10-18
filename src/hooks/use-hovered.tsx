import { Block } from '@/db'
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useDeferredValue, useState } from 'react'

type Hovered = {
  State: Block['id'] | undefined
  Set: Dispatch<SetStateAction<Hovered['State']>>
}

const Context = createContext<{
  setHovered: Hovered['Set']
  isHovered: (arg: Hovered['State']) => boolean
} | null>(null)

export function useHovered() {
  const ctx = useContext(Context)
  if (!ctx) throw new Error('useHovered must be used within an HoveredProvider')
  return ctx
}

export function HoveredProvider(props: { children: ReactNode }) {
  const [hovered, setHovered] = useState<Hovered['State']>()

  function isHovered(arg: Hovered['State']) {
    return arg === hovered
  }

  return <Context.Provider value={{ isHovered, setHovered }}>{props.children}</Context.Provider>
}

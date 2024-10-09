import { Block, Template } from '@/db'
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react'

type Active = {
  State: { store: 'blocks'; id: Block['id'] } | { store: 'templates'; id: Template['id'] } | undefined
  Set: Dispatch<SetStateAction<Active['State']>>
}

const Context = createContext<{
  active: Active['State']
  setActive: Active['Set']
  isActive: (arg: Active['State']) => boolean
} | null>(null)

export function useActive() {
  const ctx = useContext(Context)
  if (!ctx) throw new Error('useActive must be used within an ActiveProvider')
  return ctx
}

export function ActiveProvider(props: { children: ReactNode }) {
  const [active, setActive] = useState<Active['State']>()

  function isActive(arg: Active['State']) {
    if (arg?.id === active?.id && arg?.store === active?.store) return true
    return false
  }

  return <Context.Provider value={{ isActive, active, setActive }}>{props.children}</Context.Provider>
}

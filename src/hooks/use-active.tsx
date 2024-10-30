import { Block, Template } from '@/db'
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react'

type Active = {
  State: Array<{ store: 'blocks'; id: Block['id'] } | { store: 'templates'; id: Template['id'] }>
  Set: Dispatch<SetStateAction<Active['State']>>
}

const Context = createContext<{
  active: Active['State']
  setActive: Active['Set']
  isActive: (arg: Active['State'][number]) => boolean
  handleActiveClick: (args: { metaKey: boolean; node: Block | Template }) => void
} | null>(null)

export function useActive() {
  const ctx = useContext(Context)
  if (!ctx) throw new Error('useActive must be used within an ActiveProvider')
  return ctx
}

export function ActiveProvider(props: { children: ReactNode }) {
  const [active, setActive] = useState<Active['State']>([])

  function isActive(arg: Active['State'][number]) {
    return active.some((a) => a.store === arg.store && a.id === arg.id)
  }

  function handleActiveClick(args: { metaKey: boolean; node: Block | Template }) {
    const isActiveNode = isActive({ id: args.node.id, store: args.node.store })
    if (args.metaKey) {
      setActive((active) => {
        if (isActiveNode) return active.filter((a) => a.id !== args.node.id || a.store !== args.node.store)
        return [...active, { store: args.node.store, id: args.node.id }]
      })
    } else {
      if (isActiveNode) {
        setActive((active) => {
          if (active.length > 1) return [{ store: args.node.store, id: args.node.id }]
          return []
        })
      } else {
        setActive([{ store: args.node.store, id: args.node.id }])
      }
    }
  }

  return <Context.Provider value={{ isActive, active, setActive, handleActiveClick }}>{props.children}</Context.Provider>
}

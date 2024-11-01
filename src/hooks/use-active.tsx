import { isBlock, isTemplate } from '@/api'
import { Block, Page, Template } from '@/db'
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react'

type ActiveBlock = Block & { meta: { index: number; parent: { slot: string; node: Block | Page } } }
type ActiveTemplate = Template

type Active = {
  State: Array<ActiveBlock | ActiveTemplate>
  Set: Dispatch<SetStateAction<Active['State']>>
}

const Context = createContext<{
  active: Active['State']
  setActive: Active['Set']
  isActiveBlock: (arg: Active['State'][number]) => boolean
  isActiveTemplate: (arg: Active['State'][number]) => boolean
  handleActiveClick: (args: { metaKey: boolean; node: Active['State'][number] }) => void
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

  function isActiveBlock(arg: ActiveBlock | ActiveTemplate): arg is ActiveBlock {
    return isActive(arg) && isBlock(arg) && 'meta' in arg
  }

  function isActiveTemplate(arg: ActiveBlock | ActiveTemplate): arg is ActiveTemplate {
    return isActive(arg) && isTemplate(arg)
  }

  function handleActiveClick(args: { metaKey: boolean; node: Active['State'][number] }) {
    const isActiveNode = isActive(args.node)
    if (args.metaKey) {
      setActive((active) => {
        if (isActiveNode) return active.filter((a) => a.id !== args.node.id || a.store !== args.node.store)
        return [...active, args.node]
      })
    } else {
      if (isActiveNode) {
        setActive((active) => {
          if (active.length > 1) return [args.node]
          return []
        })
      } else {
        setActive([args.node])
      }
    }
  }

  return <Context.Provider value={{ isActiveTemplate, isActiveBlock, active, setActive, handleActiveClick }}>{props.children}</Context.Provider>
}

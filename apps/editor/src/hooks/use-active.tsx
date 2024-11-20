import { isBlock } from '#api.ts'
import { type Block, type Page, type Template } from '#db.ts'
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react'

type ActiveBlock = Block & { index: number; parent: { slot: string; node: Block | Page } }
type ActiveTemplate = Template

type Active = {
  State: { store: 'blocks'; items: Array<ActiveBlock> } | { store: 'templates'; items: Array<ActiveTemplate> } | { store: 'none'; items: [] }
  IsActive: { store: 'blocks'; item: ActiveBlock } | { store: 'templates'; item: ActiveTemplate }
  HandleActiveClick: { metaKey: boolean } & ({ store: 'blocks'; item: ActiveBlock } | { store: 'templates'; item: Template })
  Set: Dispatch<SetStateAction<Active['State']>>
}

const Context = createContext<{
  active: Active['State']
  setActive: Active['Set']
  isActive: (arg: Active['IsActive']) => boolean
  handleActiveClick: (args: Active['HandleActiveClick']) => void
} | null>(null)

export function useActive() {
  const ctx = useContext(Context)
  if (!ctx) throw new Error('useActive must be used within an ActiveProvider')
  return ctx
}

export function ActiveProvider(props: { children: ReactNode }) {
  const [active, setActive] = useState<Active['State']>({ store: 'none', items: [] })

  function isActive(arg: Active['IsActive']): boolean {
    if (!active) return false
    return active.items.some((a) => a.store === arg.store && a.id === arg.item.id)
  }

  function handleActiveClick(args: Active['HandleActiveClick']) {
    const isActiveNode = isActive(args)

    if (args.metaKey) {
      setActive((active) => {
        switch (active.store) {
          case 'blocks':
            if (args.store === 'blocks') {
              if (isActiveNode) {
                return { store: args.store, items: active.items.filter((a) => a.id !== args.item.id || a.store !== args.item.store) }
              } else {
                return { store: args.store, items: [...active.items, args.item] }
              }
            }
            return active
          case 'templates':
            if (args.store === 'templates') {
              if (isActiveNode) {
                return { store: args.store, items: active.items.filter((a) => a.id !== args.item.id || a.store !== args.item.store) }
              } else {
                return { store: args.store, items: [...active.items, args.item] }
              }
            }
            return active
          case 'none':
            if (isBlock(args.item)) {
              return { store: 'blocks', items: [args.item] }
            }
            return { store: 'templates', items: [args.item] }
        }
      })
    } else {
      setActive((active) => {
        if (isActiveNode) {
          if (active.items.length > 1) {
            if (isBlock(args.item)) {
              return { store: 'blocks', items: [args.item] }
            } else {
              return { store: 'templates', items: [args.item] }
            }
          }
          return { store: 'none', items: [] }
        } else {
          if (isBlock(args.item)) {
            return { store: 'blocks', items: [args.item] }
          } else {
            return { store: 'templates', items: [args.item] }
          }
        }
      })
    }
  }

  return <Context.Provider value={{ isActive, active, setActive, handleActiveClick }}>{props.children}</Context.Provider>
}

import * as blocks from '../blocks'

export type Blocks = keyof typeof blocks

export function isBlock(type: unknown): type is Blocks {
  if (typeof type !== 'string') return false
  return Object.keys(blocks).includes(type)
}

export function generateUniqueId() {
  return Date.now().toString() + Math.floor(Math.random() * 1000)
}

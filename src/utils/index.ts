import { type Block } from '../db'
import * as components from '../components'

export function isBlock(type: unknown): type is Block['type'] {
  if (typeof type !== 'string') return false
  return Object.keys(components).includes(type)
}

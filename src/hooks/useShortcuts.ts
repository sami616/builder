import { useHotkeys } from 'react-hotkeys-hook'
import { useActive } from './use-active'
import { useBlockDelete } from './use-block-delete'

export function useShortcuts() {
  const { active } = useActive()
  const { blockDelete } = useBlockDelete()
  const sortedActive = Object.groupBy(active, (a) => a.store)

  useHotkeys('backspace', async () => {
    if (sortedActive.blocks) {
      for (const key in sortedActive.blocks) {
        // await blockDelete({ blockId: sortedActive.blocks[key].id, parent: sortedActive.blocks[key].})
      }
    }
  })
}

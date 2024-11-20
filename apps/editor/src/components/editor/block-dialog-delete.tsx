import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#components/ui/alert-dialog.tsx'
import { Button } from '#components/ui/button.tsx'
import { type Block, type Page } from '#db.ts'
import { useBlockDeleteMany } from '#hooks/use-block-delete-many.ts'
import { useBlockDelete } from '#hooks/use-block-delete.ts'
import { type Dispatch, type SetStateAction } from 'react'

export function BlockDialogDelete(props: {
  blocks: Array<{
    id: number
    index: number
    parent: { slot: string; node: Block | Page }
  }>
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}) {
  const { blockDeleteMany } = useBlockDeleteMany()
  const { blockDelete } = useBlockDelete()
  const isSelectionMany = props.blocks.length > 1

  return (
    <AlertDialog onOpenChange={props.setOpen} open={props.open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your {isSelectionMany ? `(${props.blocks.length})` : ''} block
            {isSelectionMany ? `s` : ''}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation()
              if (props.blocks.length === 1) {
                const [block] = props.blocks
                blockDelete(block)
              } else {
                blockDeleteMany({ entries: props.blocks })
              }
              props.setOpen(false)
            }}
          >
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

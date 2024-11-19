import { useTemplateDelete } from '#hooks/use-template-delete.ts'
import { useTemplateDeleteMany } from '#hooks/use-template-delete-many.ts'
import { Button } from '#components/ui/button.tsx'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#components/ui/alert-dialog.tsx'
import { Dispatch, SetStateAction } from 'react'
import { Template } from '#db.ts'

export function TemplateDialogDelete(props: { templates: Array<Template>; open: boolean; setOpen: Dispatch<SetStateAction<boolean>> }) {
  const { templateDeleteMany } = useTemplateDeleteMany()
  const { templateDelete } = useTemplateDelete()
  const isSelectionMany = props.templates.length > 1

  return (
    <AlertDialog onOpenChange={props.setOpen} open={props.open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your {isSelectionMany ? `(${props.templates.length})` : ''} template
            {isSelectionMany ? `s` : ''}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation()
              if (props.templates.length === 1) {
                const [template] = props.templates
                templateDelete({ template })
              } else {
                templateDeleteMany({ entries: props.templates })
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

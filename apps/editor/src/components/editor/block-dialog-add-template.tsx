import { Button } from '#components/ui/button.tsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '#components/ui/dialog.tsx'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '#components/ui/form.tsx'
import { Input } from '#components/ui/input.tsx'
import { type Block, type Page } from '#db.ts'
import { useTemplateAdd } from '#hooks/use-template-add.ts'
import { zodResolver } from '@hookform/resolvers/zod'
import { type Dispatch, type SetStateAction } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const templateAddSchema = z.object({
  name: z.string(),
})

export function BlockDialogAddTemplate(props: {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  block: Block
  index: number
  parent: { slot: string; node: Block | Page }
}) {
  const { templateAdd } = useTemplateAdd()
  const templateAddForm = useForm<z.infer<typeof templateAddSchema>>({
    resolver: zodResolver(templateAddSchema),
    defaultValues: { name: '' },
  })
  return (
    <Dialog
      open={props.open}
      onOpenChange={(bool) => {
        templateAddForm.reset()

        props.setOpen(bool)
      }}
    >
      <DialogContent
        onMouseOver={(e) => e.stopPropagation()}
        onMouseOut={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className="w-96"
      >
        <DialogHeader>
          <DialogTitle>Add template</DialogTitle>
          <DialogDescription>Add a new template to your library.</DialogDescription>
        </DialogHeader>

        <Form {...templateAddForm}>
          <form
            onSubmit={templateAddForm.handleSubmit(async (values) => {
              templateAdd({
                name: values.name.trim() === '' ? undefined : values.name.trim(),
                source: { id: 'block', index: props.index, node: props.block, parent: props.parent },
              })
              props.setOpen(false)
            })}
            className="grid gap-4"
          >
            <FormField
              control={templateAddForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Add template</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

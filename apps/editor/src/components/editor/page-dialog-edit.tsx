import { Button } from '#components/ui/button.tsx'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '#components/ui/dialog.tsx'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '#components/ui/form.tsx'
import { Input } from '#components/ui/input.tsx'
import { Separator } from '#components/ui/separator.tsx'
import { Switch } from '#components/ui/switch.tsx'
import { type DBStores } from '@repo/lib'
import { usePageUpdateMeta } from '#hooks/use-page-update-meta.ts'
import { zodResolver } from '@hookform/resolvers/zod'
import { type Dispatch, type SetStateAction } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

const formSchema = z.object({
  title: z.string().trim().min(1, { message: 'Title required' }),
  slug: z
    .string()
    .trim()
    .min(1, { message: 'Slug required' })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: 'Slug must only contain lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen.',
    }),
  standalone: z.boolean(),
  description: z.string().optional(),
  url: z.string().optional(),
})

export function PageDialogEdit(props: { selectedPage: DBStores['Page']; open: boolean; setOpen: Dispatch<SetStateAction<boolean>> }) {
  const { pageUpdateMeta } = usePageUpdateMeta()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      standalone: props.selectedPage.url || props.selectedPage.description ? true : false,
      title: props.selectedPage.title,
      description: props.selectedPage.description,
      slug: props.selectedPage.slug,
    },
  })

  const standalone = useWatch({ control: form.control, name: 'standalone' })

  return (
    <>
      <Dialog open={props.open} onOpenChange={props.setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit page</DialogTitle>
            <DialogDescription>Edit your page details</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              className="grid gap-4"
              onSubmit={form.handleSubmit(async (values) => {
                await pageUpdateMeta({
                  page: props.selectedPage,
                  title: values.title,
                  description: values.description ?? '',
                  slug: values.slug,
                  url: values.url ?? '',
                  status: 'Published',
                })
                props.setOpen(false)
              })}
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input required placeholder="My landing page" {...field} />
                    </FormControl>
                    <FormDescription>The name of your page</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input required placeholder="my-landing-page" {...field} />
                    </FormControl>
                    <FormDescription>
                      The URL-friendly part of your page address (e.g., yourwebsite.com/page-slug). Use lowercase letters, numbers, and hyphens.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Separator />
              <FormField
                control={form.control}
                name="standalone"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="mr-2">Standalone page</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </div>
                    <FormDescription>Will this page be embedded into another page, or be an standalone experience?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {standalone && (
                <>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>The page description for search indexing</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://yourwebsite.com" {...field} />
                        </FormControl>
                        <FormDescription>The URL of you page. This will be used to generate user friendly social media links</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
                <Button type="submit" variant="default">
                  Create
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}

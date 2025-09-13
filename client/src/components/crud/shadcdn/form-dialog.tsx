import type {FieldValues, UseFormReturn} from "react-hook-form";
import type {PropsWithChildren, ReactNode} from "react";
import {LoaderCircle, XIcon} from "lucide-react";
import {Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Form} from "@/components/ui/form";
import {Button} from "@/components/ui/button";

export interface FormDialogProps<TDto extends FieldValues> extends PropsWithChildren {
  title: string;
  description: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<TDto>;
  submit: () => Promise<void>;
  dialogClassName?: string;
  confirmButtonText: string;
  confirmButtonIcon: ReactNode;
  cancelButtonText?: string;
  cancelButtonIcon?: ReactNode;
}

export function FormDialog<F extends FieldValues>({
  title,
  description,
  open,
  onOpenChange,
  form,
  submit,
  dialogClassName,
  confirmButtonText,
  confirmButtonIcon,
  cancelButtonText = "Cancelar",
  cancelButtonIcon = <XIcon/>,
  children
}: Readonly<FormDialogProps<F>>) {
  
  const errors = form.formState.errors;
  
  const onOpenChangeHandle = (open: boolean) => {
    if (form.formState.isSubmitting) return;
    onOpenChange(open);
  }
  
  return <Dialog open={open} onOpenChange={onOpenChangeHandle} >
    <DialogContent className={dialogClassName} onInteractOutside={(e) => e.preventDefault()}>
      <Form {...form}>
        <form onSubmit={submit} autoComplete='off'>
          <DialogHeader className='mb-5'>
            <DialogTitle className='text-2xl font-bold'>
              {title}
            </DialogTitle>
            <DialogDescription>
              {description}
            </DialogDescription>
          </DialogHeader>
          {children}
          {errors.root && (
            <div className='text-destructive text-sm mt-2'>
              {errors.root.message}
            </div>
          )}
          <DialogFooter className='justify-end mt-4'>
            <DialogClose asChild>
              <Button
                type='button'
                variant='secondary'
                className='mt-3 sm:mt-0'
              >
                {cancelButtonIcon}
                {cancelButtonText}
              </Button>
            </DialogClose>
            <Button type='submit'>
              {form.formState.isSubmitting ? <LoaderCircle className='animate-spin'/> : confirmButtonIcon}
              {confirmButtonText}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  </Dialog>
}
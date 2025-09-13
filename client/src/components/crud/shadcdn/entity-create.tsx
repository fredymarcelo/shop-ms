import type {Entity} from "@/lib/crud";
import type {FieldValues} from "react-hook-form";
import type {CreateProps, EntityActionProps} from "@/components/crud/entity-crud";
import {useEntityCreate} from "@/components/crud/use-entity-create";
import {SaveIcon} from "lucide-react";
import {FormDialog} from "@/components/crud/shadcdn/form-dialog";

export function EntityCreateForm<TEntity extends Entity<ID>, Dto extends FieldValues, ID = TEntity['id']>({
  open,
  onOpenChange,
  createAction,
  resolver,
  defaultValues,
  renderForm: RenderForm,
  onSuccess,
  crudApi,
}: Readonly<CreateProps<TEntity, Dto> & Omit<EntityActionProps<TEntity, ID>, 'entity'>>) {
  
  const {form, submit} = useEntityCreate({
    createAction,
    resolver: resolver(),
    defaultValues: defaultValues(),
    onSuccess
  })
  
  return <FormDialog
    title="Crear nuevo registro"
    description="Complete el formulario para crear un nuevo registro."
    dialogClassName='max-w-[90vw] max-h-[90vh] overflow-y-auto min-w-[80vw]'
    open={open}
    onOpenChange={onOpenChange}
    form={form}
    submit={submit}
    confirmButtonText="Crear"
    confirmButtonIcon={<SaveIcon/>}
  >
    <RenderForm
      form={form}
      crudApi={crudApi}
      close={() => onOpenChange(false)}
    />
  </FormDialog>
  
}
import type {Entity} from "@/lib/crud";
import type {FieldValues} from "react-hook-form";
import type {EntityActionProps, UpdateProps} from "@/components/crud/entity-crud.ts";
import {useEntityUpdate} from "@/components/crud/use-entity-update";
import {EditIcon} from "lucide-react";
import {FormDialog} from "@/components/crud/shadcdn/form-dialog";

export function EntityUpdateForm<TEntity extends Entity<ID>, Dto extends FieldValues, ID = TEntity['id']>({
  entity,
  open,
  onOpenChange,
  updateAction,
  resolver,
  defaultValues,
  renderForm: RenderForm,
  onSuccess,
  crudApi,
}: Readonly<UpdateProps<TEntity, Dto, ID> & EntityActionProps<TEntity, ID>>) {
  
  const {form, submit} = useEntityUpdate({
    entity,
    resolver,
    defaultValues,
    updateAction,
    onSuccess,
  })
  
  return <FormDialog
    title="Actualizar registro"
    description="Actualice los datos del registro."
    dialogClassName='max-w-[90vw] max-h-[90vh] overflow-y-auto min-w-[80vw]'
    open={open}
    onOpenChange={onOpenChange}
    form={form}
    submit={submit}
    confirmButtonText="Actualizar"
    confirmButtonIcon={<EditIcon/>}
  >
    <RenderForm
      form={form}
      entity={entity}
      crudApi={crudApi}
      close={() => onOpenChange(false)}
    />
  </FormDialog>
}

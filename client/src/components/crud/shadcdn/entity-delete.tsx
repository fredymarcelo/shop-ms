import {type Entity} from "@/lib/crud";
import type {DeleteProps, EntityActionProps} from "@/components/crud/entity-crud.ts";
import {useEntityDelete} from "@/components/crud/use-entity-delete";
import {TrashIcon} from "lucide-react";
import {FormDialog} from "@/components/crud/shadcdn/form-dialog";
import {toast} from "sonner";

export function EntityDeleteForm<TEntity extends Entity<ID>, ID = TEntity['id']>({
  entity,
  open,
  onOpenChange,
  deleteAction,
  onSuccess,
}: Readonly<DeleteProps<TEntity, ID> & EntityActionProps<TEntity, ID>>) {
  
  const {form, submit} = useEntityDelete({
    entity,
    deleteAction,
    onSuccess: e => {
      if (onSuccess) onSuccess(e);
      onOpenChange(false);
      toast.success('Registro eliminado correctamente');
    }
  });
  
  return <FormDialog
    title="Eliminar registro"
    description="¿Seguro que deseas eliminar este registro? Esta acción no se puede deshacer."
    open={open}
    onOpenChange={onOpenChange}
    form={form}
    submit={submit}
    confirmButtonText="Eliminar"
    confirmButtonIcon={<TrashIcon/>}
  >
  </FormDialog>
  
}
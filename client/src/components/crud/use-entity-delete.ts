import type {Deletable, Entity} from "@/lib/crud";
import {type FieldValues, useForm} from "react-hook-form";
import {setFormErrors} from "@/lib/forms";

export interface EntityDeleteProps<TEntity extends Entity<ID>, ID> {
  entity: TEntity;
  deleteAction: Deletable<ID>["delete"];
  onSuccess?: (entity: TEntity) => (void | Promise<void>);
}

export interface EntityDelete {
  form: ReturnType<typeof useForm<FieldValues>>;
  submit: () => Promise<void>;
}

export function useEntityDelete<TEntity extends Entity<ID>, ID = TEntity["id"]>({
  entity,
  deleteAction,
  onSuccess,
}: EntityDeleteProps<TEntity, ID>): EntityDelete {
  
  const form = useForm()
  
  const submit = form.handleSubmit(async () => {
    const result = await deleteAction(entity.id);
    if (result.success) {
      if (onSuccess) onSuccess(entity);
    } else {
      setFormErrors(form, result.error);
      throw result.error;
    }
  });
  
  return {
    form,
    submit,
  }
}
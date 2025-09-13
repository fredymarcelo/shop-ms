import {type DefaultValues, type FieldValues, type Resolver, useForm} from "react-hook-form";
import {useEffect} from "react";
import {setFormErrors} from "@/lib/forms";
import type {Entity, Updatable} from "@/lib/crud";

export interface EntityUpdateProps<TEntity extends Entity<ID>, Dto extends FieldValues, ID = TEntity["id"]> {
  updateAction: Updatable<TEntity, Dto, ID>['update'];
  entity: TEntity;
  resolver: (entity: TEntity) => Resolver<Dto>;
  defaultValues: (entity: TEntity) => DefaultValues<Dto>;
  onSuccess?: (entity: TEntity) => (void | Promise<void>);
}

export interface EntityUpdate<Dto extends FieldValues> {
  form: ReturnType<typeof useForm<Dto>>;
  submit: () => Promise<void>;
}

export function useEntityUpdate<TEntity extends Entity<ID>, Dto extends FieldValues, ID = TEntity["id"]>({
  updateAction,
  entity,
  resolver,
  defaultValues,
  onSuccess,
}: EntityUpdateProps<TEntity, Dto, ID>): EntityUpdate<Dto> {
  
  const form = useForm<Dto>({
    resolver: resolver(entity),
    defaultValues: defaultValues(entity),
  });
  
  useEffect(() => {
    form.reset(defaultValues(entity));
  }, [entity, form, defaultValues]);
  
  const submit = form.handleSubmit(async (dto: Dto) => {
    console.log(dto)
    const result = await updateAction(entity.id, dto);
    if (result.success) {
      if (onSuccess) await onSuccess(result.data);
      form.reset(defaultValues(result.data));
    } else {
      setFormErrors(form, result.error);
      throw result.error;
    }
  });
  
  return {
    form,
    submit
  }
}
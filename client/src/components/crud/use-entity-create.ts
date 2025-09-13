import {type DefaultValues, type FieldValues, type Resolver, useForm} from "react-hook-form";
import {setFormErrors} from "@/lib/forms";
import type {Creatable} from "@/lib/crud";

export interface EntityCreateProps<TEntity, Dto extends FieldValues> {
  createAction: Creatable<TEntity, Dto>['create'];
  resolver: Resolver<Dto>;
  defaultValues: DefaultValues<Dto>;
  onSuccess?: (entity: TEntity) => (void | Promise<void>);
}

export interface EntityCreate<Dto extends FieldValues> {
  form: ReturnType<typeof useForm<Dto>>;
  submit: () => Promise<void>;
}

export function useEntityCreate<TEntity, Dto extends FieldValues>({
  createAction,
  resolver,
  defaultValues,
  onSuccess,
}: EntityCreateProps<TEntity, Dto>): EntityCreate<Dto> {
  
  const form = useForm<Dto>({
    resolver: resolver,
    defaultValues: defaultValues,
  });
  
  const submit = form.handleSubmit(async (dto: Dto) => {
    const result = await createAction(dto)
    if (result.success) {
      if (onSuccess) await onSuccess(result.data);
      form.reset(defaultValues);
    } else {
      setFormErrors(form, result.error);
      throw result.error;
    }
  });
  
  return {
    form,
    submit
  };
}
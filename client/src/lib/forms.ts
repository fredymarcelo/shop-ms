import type {FieldValues, Path, UseFormReturn} from "react-hook-form";
import type {ErrorDescription, ValidationError} from "@/lib/errors";

export function setFormErrors<TFieldValues extends FieldValues = FieldValues>(form: UseFormReturn<TFieldValues>, error: ErrorDescription | ValidationError[]): void {
  if (Array.isArray(error)) {
    for (const {field, messages} of error) {
      const name = convertBracketToDotNotation(field) as Path<TFieldValues>;
      const message = messages.join(", ");
      form.setError(name, {message});
    }
    return;
  }
  
  setFormRootError(form, error.description);
}


export function setFormRootError<TFieldValues extends FieldValues = FieldValues>(form: UseFormReturn<TFieldValues>, error: string): void {
  form.setError("root", {type: "manual", message: error,});
}

function convertBracketToDotNotation(str: string): string {
  return str.replace(/\[(\d+)]/g, ".$1");
}
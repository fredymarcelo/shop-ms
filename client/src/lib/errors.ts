import {isAxiosError} from "axios";
import {isProblemDetails} from "@/lib/http";


const defaultError: ErrorDescription = {
  title: "Error",
  description: "Ocurrió un error inesperado"
}

export interface ErrorDescription {
  title: string;
  description: string;
}

export abstract class ErrorDescriptions {
  static create(title: string, description: string): ErrorDescription {
    return {title, description};
  }
}

export type ValidationError = {
  field: string;
  messages: string[];
}

function getPayloadError(error: unknown): unknown {
  if (isAxiosError(error)) {
    const response = error.response;
    if (response) return response.data;
    return {title: "Error", detail: error.cause ?? error.message,}
  }
  return error;
}

function _tryParseError(errorPayload: unknown): ErrorDescription | undefined {
  if (typeof errorPayload === "string") return {title: "Error", description: errorPayload};
  if (isErrorDescription(errorPayload)) return errorPayload;
  if (isProblemDetails(errorPayload)) return {title: errorPayload.title, description: errorPayload.detail};
  // AGREGAR MÁS PARSEADORES SI HACE FALTA
}

function _tryParseValidationErrors(error: unknown): ValidationError[] | undefined {
  if (isValidationErrorArray(error)) return error;
  if (isProblemDetails(error)) {
    if (isValidationErrorArray(error["errors"])) return error["errors"];
  }
}

export function tryParseError(error: unknown): ErrorDescription | undefined {
  const payload = getPayloadError(error);
  return _tryParseError(payload);
}

export function parseError(error: unknown): ErrorDescription {
  const parsed = tryParseError(error)
  if (parsed) return parsed;
  console.error("Unexpected error: ", error);
  return defaultError;
}

export function parseValidationErrors(error: unknown): ValidationError[] {
  const payload = getPayloadError(error);
  const parsed = _tryParseValidationErrors(payload);
  if (parsed) return parsed;
  console.error("Unexpected error: ", error);
  return [];
}

export function parseErrorOrValidationErrors(error: unknown): ValidationError[] | ErrorDescription {
  const payload = getPayloadError(error);
  const parsed = _tryParseValidationErrors(payload) || _tryParseError(payload);
  if (parsed) return parsed;
  console.error("Unexpected error: ", error);
  return defaultError;
}

export function isErrorDescription(obj: unknown): obj is ErrorDescription {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "description" in obj &&
    "title" in obj &&
    typeof obj.description === "string" &&
    typeof obj.title === "string"
  );
}

export function isValidationError(obj: unknown): obj is ValidationError {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "field" in obj &&
    "messages" in obj &&
    typeof obj.field === "string" &&
    Array.isArray(obj.messages)
  );
}

export function isValidationErrorArray(obj: unknown): obj is ValidationError[] {
  return Array.isArray(obj) && obj.every(isValidationError);
}
import * as axios from "axios";

export type ProblemDetails<TExtensions = Record<string, unknown>> = {
  title: string;
  status: number;
  detail: string;
  instance: string;
  type: string;
} & TExtensions;

export function isProblemDetails(obj: unknown): obj is ProblemDetails {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "title" in obj &&
    "status" in obj &&
    "detail" in obj &&
    "instance" in obj &&
    "type" in obj &&
    typeof obj.title === "string" &&
    typeof obj.status === "number" &&
    typeof obj.detail === "string" &&
    typeof obj.instance === "string" &&
    typeof obj.type === "string"
  );
}


const PRODUCTS_API_URL = import.meta.env.VITE_PRODUCTS_API_URL as string;
const SALES_API_URL = import.meta.env.VITE_SALES_API_URL as string;

export const productsClient = axios.default.create({baseURL: PRODUCTS_API_URL});
export const salesClient = axios.default.create({baseURL: SALES_API_URL});
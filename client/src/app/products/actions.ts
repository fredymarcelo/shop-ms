import {restCrud} from "@/lib/rest-crud.ts";
import {productsClient} from "@/lib/http.ts";
import {Product, ProductDto} from "@/app/products/definitions.ts";

const crud = restCrud<Product, ProductDto>(productsClient, '/products');

export const productService = {
  ...crud,
}
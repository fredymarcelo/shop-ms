import {DefaultValues, Resolver} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";

export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  stock: number;
}

export interface ProductDto {
  name: string;
  price: number;
  description: string;
  stock: number;
}

export function productDefaultValues(entity?: Product): DefaultValues<ProductDto> {
  return {
    name: entity?.name || '',
    price: entity?.price || 0,
    description: entity?.description || '',
    stock: entity?.stock || 0,
  }
}

export function productResolver(): Resolver<ProductDto> {
  return zodResolver(z.object({
    
    name: z
    .string()
    .nonempty({error: 'El nombre es obligatorio'})
    .min(3, {error: 'El nombre debe tener al menos 3 caracteres'})
    .max(100, {error: 'El nombre debe tener como máximo 100 caracteres'}),
    
    price: z
    .coerce
    .number({error: 'El precio debe ser un número'})
    .multipleOf(0.01, {error: 'El precio debe tener como máximo 2 decimales'})
    .min(0, {error: 'El precio no puede ser negativo'})
    .max(1000000, {error: 'El precio no puede ser mayor a 1,000,000'}) as z.ZodNumber,
    
    description: z
    .string()
    .nonempty({error: 'La descripción es obligatoria'})
    .min(10, {error: 'La descripción debe tener al menos 10 caracteres'})
    .max(500, {error: 'La descripción debe tener como máximo 500 caracteres'}),
    
    stock: z
    .coerce
    .number({error: 'El stock debe ser un número'})
    .min(0, {error: 'El stock no puede ser negativo'})
    .max(10000, {error: 'El stock no puede ser mayor a 10,000'}) as z.ZodNumber,
    
  }));
}

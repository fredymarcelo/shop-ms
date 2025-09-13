import {ZonedDateTime} from "@internationalized/date";
import {Product} from "@/app/products/definitions.ts";
import {DefaultValues, Resolver} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";

export interface Sale {
  id: string;
  date: ZonedDateTime;
  customerCi: string
  items: {
    product: Product
    price: number
    quantity: number
    subTotal: number
  }[]
  iva: number
  total: number
  totalWithIva: number
  paymentMethod: PaymentMethod
}

export interface SaleDto {
  customerCi: string
  items: {
    productId: number
    quantity: number
  }[]
  iva: number
  paymentMethod: PaymentMethod
}

export enum PaymentMethod {
  CARD = 'CARD',
  CASH = 'CASH',
  TRANSFER = 'TRANSFER'
}

export function saleDefaultValues(entity?: Sale): DefaultValues<SaleDto> {
  return {
    customerCi: entity?.customerCi || '',
    items: entity?.items.map(i => ({
      productId: i.product.id,
      quantity: i.quantity,
    })) || [],
    iva: entity?.iva || 15,
    paymentMethod: entity?.paymentMethod || PaymentMethod.CASH,
  }
}

export function saleResolver(): Resolver<SaleDto> {
  return zodResolver(z.object({
    
    customerCi: z
    .string()
    .nonempty({error: 'La cédula es obligatoria'})
    .length(10, {error: 'La cédula debe tener 10 caracteres'})
    .regex(/^[0-9]+$/, {error: 'La cédula debe contener solo números'}),
    
    items: z
    .array(z.object({
      
      productId: z
      .number({error: 'El producto es obligatorio'}),
      
      quantity: z
      .coerce
      .number({error: 'La cantidad es obligatoria'})
      .int({error: 'La cantidad debe ser un número entero'})
      .positive({error: 'La cantidad debe ser un número positivo'})
      .max(1000, {error: 'La cantidad no puede ser mayor a 1000'}) as z.ZodNumber,
      
    }))
    .min(1, {error: 'Debe agregar al menos un producto'}),
    
    iva: z
    .coerce
    .number({error: 'El IVA es obligatorio'})
    .min(0, {error: 'El IVA no puede ser negativo'})
    .max(100, {error: 'El IVA no puede ser mayor a 100'}) as z.ZodNumber,
    
    paymentMethod: z
    .enum(PaymentMethod, {error: 'El método de pago es obligatorio'})
  }))
}

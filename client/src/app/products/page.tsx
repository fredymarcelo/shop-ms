import {useMemo} from "react";
import {ColumnDef} from "@tanstack/react-table";
import {Product, productDefaultValues, ProductDto, productResolver} from "@/app/products/definitions.ts";
import {BreadcrumbLayout} from "@/components/design/breadcrumb/breadcrumb-layout.tsx";
import {EntityCrud} from "@/components/crud/shadcdn/entity-crud.tsx";
import {productService} from "@/app/products/actions.ts";
import {EntityFormProps} from "@/components/crud/entity-crud.ts";
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";

export default function Page() {
  
  const columns = useMemo<ColumnDef<Product>[]>(() => [
    {
      accessorKey: 'name',
      header: 'Nombre',
    },
    {
      accessorKey: 'price',
      header: 'Precio',
      cell: ({row}) => new Intl.NumberFormat('es-EC', {
        style: 'currency',
        currency: 'USD'
      }).format(row.original.price)
    },
    {
      accessorKey: 'description',
      header: 'Descripción',
    },
    {
      accessorKey: 'stock',
      header: 'Stock',
    }
  ], []);
  
  return <BreadcrumbLayout
    homePage="/"
    breadcrumbs={["Productos"]}
  >
    <EntityCrud
      cacheKey="products"
      create={{
        resolver: productResolver,
        defaultValues: productDefaultValues,
        createAction: productService.create,
        renderForm: Form
      }}
      read={{
        columns,
        title: "Productos",
        pageAction: productService.page,
        findAction: productService.find,
      }}
      update={{
        resolver: productResolver,
        defaultValues: productDefaultValues,
        updateAction: productService.update,
        renderForm: Form
      }}
      delete={{
        deleteAction: productService.delete,
      }}
    />
  </BreadcrumbLayout>
}

function Form({form}: Readonly<EntityFormProps<Product, ProductDto>>) {
  return <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <FormField
      control={form.control}
      name="name"
      render={({field}) => (
        <FormItem className="lg:col-span-2">
          <FormLabel>Nombre</FormLabel>
          <FormControl>
            <Input  {...field} type="text" placeholder="Nombre"/>
          </FormControl>
          <FormMessage/>
        </FormItem>
      )}
    />
    
    <FormField
      control={form.control}
      name="price"
      render={({field}) => (
        <FormItem className="lg:col-span-1">
          <FormLabel>Precio</FormLabel>
          <FormControl>
            <Input  {...field} type="number" step="0.01" min="0" placeholder="Precio"/>
          </FormControl>
          <FormMessage/>
        </FormItem>
      )}
    />
    
    <FormField
      control={form.control}
      name="stock"
      render={({field}) => (
        <FormItem className="lg:col-span-1">
          <FormLabel>Stock</FormLabel>
          <FormControl>
            <Input  {...field} type="number" step="1" min="0" placeholder="Stock"/>
          </FormControl>
          <FormMessage/>
        </FormItem>
      )}
    />
    
    <FormField
      control={form.control}
      name="description"
      render={({field}) => (
        <FormItem className="lg:col-span-4">
          <FormLabel>Descripción</FormLabel>
          <FormControl>
            <Textarea {...field} placeholder="Descripción" rows={4}/>
          </FormControl>
          <FormMessage/>
        </FormItem>
      )}
    />
  </div>
}

  
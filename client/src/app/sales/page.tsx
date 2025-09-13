import {useMemo, useState} from "react";
import {ColumnDef} from "@tanstack/react-table";
import {useFieldArray} from "react-hook-form";
import {Sale, saleDefaultValues, SaleDto, saleResolver, PaymentMethod} from "@/app/sales/definitions.ts";
import {BreadcrumbLayout} from "@/components/design/breadcrumb/breadcrumb-layout";
import {EntityCrud} from "@/components/crud/shadcdn/entity-crud";
import {salesService} from "@/app/sales/actions.ts";
import {EntityFormProps} from "@/components/crud/entity-crud.ts";
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Trash2, Plus} from "lucide-react";
import {productService} from "@/app/products/actions.ts";
import {Product} from "@/app/products/definitions.ts";
import {ComboboxQuery, fromPage} from "@/components/ui/combobox.tsx";
import {cn} from "@/lib/utils.ts";
import {useQueryClient} from "@tanstack/react-query";

export default function Page() {
  
  const columns = useMemo<ColumnDef<Sale>[]>(() => [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({row}) => {
        return <div className="font-mono text-sm">
          {row.original.id.substring(0, 8)}...
        </div>;
      }
    },
    {
      accessorKey: 'date',
      header: 'Fecha',
      cell: ({row}) => {
        return <div>
          {row.original.date.toDate().toLocaleDateString('es-EC')}
        </div>;
      }
    },
    {
      accessorKey: 'customerCi',
      header: 'Cédula Cliente',
    },
    {
      accessorKey: 'items',
      header: 'Productos',
      cell: ({row}) => {
        return <div className="flex gap-1 flex-wrap max-w-xs">
          {row.original.items.map((item) => (
            <Badge key={item.product.id} variant="secondary" className="text-xs">
              {item.product.name} x{item.quantity}
            </Badge>
          ))}
        </div>;
      }
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Método Pago',
      cell: ({row}) => {
        const methodLabels = {
          [PaymentMethod.CASH]: 'Efectivo',
          [PaymentMethod.CARD]: 'Tarjeta',
          [PaymentMethod.TRANSFER]: 'Transferencia'
        };
        return <Badge variant="outline">
          {methodLabels[row.original.paymentMethod]}
        </Badge>;
      }
    },
    {
      accessorKey: 'totalWithIva',
      header: 'Total',
      cell: ({row}) => {
        return <div className="font-semibold text-right">
          ${row.original.totalWithIva.toFixed(2)}
        </div>;
      }
    }
  ], []);
  
  const queryClient = useQueryClient();
  
  return <BreadcrumbLayout
    homePage="/"
    breadcrumbs={["Ventas"]}
  >
    <EntityCrud
      cacheKey="sales"
      create={{
        resolver: saleResolver,
        defaultValues: saleDefaultValues,
        createAction: salesService.create,
        renderForm: Form,
        onSuccess: () => queryClient.removeQueries({queryKey: ['products']})
      }}
      read={{
        columns,
        title: "Ventas",
        pageAction: salesService.page,
        findAction: salesService.find,
      }}
      delete={{
        deleteAction: salesService.delete,
      }}
    />
  </BreadcrumbLayout>
}

function Form({form}: Readonly<EntityFormProps<Sale, SaleDto>>) {
  const {fields, append, remove, move} = useFieldArray({
    control: form.control,
    name: "items"
  });
  
  console.log("Errors form", form.formState.errors);
  const [products, setProducts] = useState<Product[]>([]);
  
  const addItem = () => {
    append({
      productId: null as unknown as number,
      quantity: 1
    });
  };
  
  const paymentMethodOptions = [
    {value: PaymentMethod.CASH, label: 'Efectivo'},
    {value: PaymentMethod.CARD, label: 'Tarjeta'},
    {value: PaymentMethod.TRANSFER, label: 'Transferencia'}
  ];
  
  const watchedItems = form.watch("items");
  const watchedIva = form.watch("iva");
  
  // Calcular totales en tiempo real
  const subtotal = useMemo(() => {
    if (!watchedItems?.length) return 0;
    
    return watchedItems.reduce((sum, item) => {
      // Validar que el item tenga datos completos
      if (!item?.productId || !item?.quantity || item.quantity <= 0) {
        return sum;
      }
      
      // Buscar el producto y calcular subtotal
      const product = products.find(p => p.id === item.productId);
      if (!product) return sum;
      
      const itemTotal = product.price * item.quantity;
      return sum + itemTotal;
    }, 0);
  }, [watchedItems, products]);
  
  const ivaAmount = subtotal * (watchedIva || 0) / 100;
  const total = subtotal + ivaAmount;
  
  return <div className="space-y-6">
    {/* Información del Cliente */}
    <Card>
      <CardHeader>
        <CardTitle>Información del Cliente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="customerCi"
            render={({field}) => (
              <FormItem>
                <FormLabel>Cédula del Cliente</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder="1234567890"
                    maxLength={10}
                    onChange={(e) => {
                      // Solo permitir números
                      const value = e.target.value.replace(/\D/g, '');
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage/>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({field}) => (
              <FormItem>
                <FormLabel>{"Método de Pago"}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione método de pago"/>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {paymentMethodOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage/>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
    
    {/* Productos */}
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Productos ({fields.length})</CardTitle>
        <Button
          type="button"
          onClick={addItem}
          size="sm"
          variant="outline"
        >
          <Plus className="h-4 w-4 mr-2"/>
          Agregar Producto
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {fields.map((field, index) => {
            const selectedProduct = products.find(p => p.id === form.watch(`items.${index}.productId`));
            const itemQuantity = form.watch(`items.${index}.quantity`) || 0;
            const itemSubtotal = selectedProduct ? selectedProduct.price * itemQuantity : 0;
            
            return (
              <div key={field.id} className="flex items-end gap-4 p-4 border rounded-lg bg-muted/20">
                <div className="text-sm font-medium text-muted-foreground w-8">
                  #{index + 1}
                </div>
                
                <FormField
                  control={form.control}
                  name={`items.${index}.productId`}
                  render={({field}) => (
                    <FormItem className="flex-1">
                      <FormLabel>Producto</FormLabel>
                      <FormControl>
                        <ComboboxQuery<Product>
                          queryKey={["products"]}
                          queryFn={fromPage(async search => await productService.page({search, size: 10}))}
                          value={product => product?.id === field.value}
                          onSelect={value => {
                            if (value) {
                              field.onChange(value.id ?? null)
                              setProducts(prev => [...prev, value]);
                            } else {
                              field.onChange(null);
                              setProducts(prev => prev.filter(p => p.id !== field.value));
                            }
                          }}
                          toOption={product => ({
                            value: product.id.toString(),
                            label: product.name + " (" + product.stock + ")",
                          })}
                        />
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name={`items.${index}.quantity`}
                  render={({field}) => (
                    <FormItem className="w-24">
                      <FormLabel>Cant.</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setProducts(prev => [...prev]); // Forzar re-render para actualizar totales
                          }}
                          type="number"
                          min="1"
                          max={selectedProduct?.stock || 1000}
                          placeholder="1"
                        />
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  )}
                />
                
                <div className="w-28 text-right">
                  <FormLabel className="text-xs text-muted-foreground">Subtotal</FormLabel>
                  <div className="font-semibold">
                    ${itemSubtotal.toFixed(2)}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => move(index, index - 1)}
                      title="Mover arriba"
                    >
                      ↑
                    </Button>
                  )}
                  
                  {index < fields.length - 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => move(index, index + 1)}
                      title="Mover abajo"
                    >
                      ↓
                    </Button>
                  )}
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4"/>
                  </Button>
                </div>
              </div>
            );
          })}
          
          {fields.length === 0 && (
            <div
              className={cn(
                "text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg",
                form.formState.errors.items ? "border-destructive text-destructive" : "border-border"
              )}>
              No hay productos agregados. Haga clic en "Agregar Producto" para comenzar.
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
      
      </CardFooter>
    </Card>
    
    {/* Configuración y Resumen */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Configuración de IVA */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración</CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="iva"
            render={({field}) => (
              <FormItem>
                <FormLabel>IVA (%)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    placeholder="15"
                  />
                </FormControl>
                <FormMessage/>
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
      
      {/* Resumen de Totales */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>IVA ({watchedIva || 0}%):</span>
            <span>${ivaAmount.toFixed(2)}</span>
          </div>
          <hr/>
          <div className="flex justify-between font-semibold text-lg">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
}
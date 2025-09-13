import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Package, ShoppingCart, TrendingUp, Users} from "lucide-react";
import {Link} from "react-router";

function Page() {
  const features = [
    {
      title: "Productos",
      description: "Gestiona tu inventario y catálogo de productos",
      icon: Package,
      href: "/products"
    },
    {
      title: "Ventas",
      description: "Registra y administra las ventas del negocio",
      icon: ShoppingCart,
      href: "/sales"
    }
  ];
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">
            Sistema de Ventas
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Gestiona tu negocio de forma sencilla con nuestro sistema de productos y ventas
          </p>
          <div className="mt-6 text-sm text-muted-foreground">
            Proyecto de Microservicios - Universidad 🎓
          </div>
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {features.map((feature) => (
            <Card key={feature.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-secondary">
                    <feature.icon className="h-8 w-8"/>
                  </div>
                </div>
                <CardTitle className="text-2xl font-semibold">
                  {feature.title}
                </CardTitle>
                <CardDescription>
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button asChild className="w-full">
                  <Link to={feature.href}>
                    Ir a {feature.title}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <Card className="text-center p-6">
            <TrendingUp className="h-6 w-6 mx-auto mb-2"/>
            <div className="text-2xl font-bold">Simple</div>
            <div className="text-sm text-muted-foreground">Fácil de usar</div>
          </Card>
          
          <Card className="text-center p-6">
            <Users className="h-6 w-6 mx-auto mb-2"/>
            <div className="text-2xl font-bold">Efectivo</div>
            <div className="text-sm text-muted-foreground">Para pequeños negocios</div>
          </Card>
          
          <Card className="text-center p-6">
            <Package className="h-6 w-6 mx-auto mb-2"/>
            <div className="text-2xl font-bold">Moderno</div>
            <div className="text-sm text-muted-foreground">Arquitectura de microservicios</div>
          </Card>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-16 text-muted-foreground text-sm">
          <p>Desarrollado con ❤️ para aprender microservicios</p>
        </div>
      </div>
    </div>
  );
}

export default Page;
import { 
  ChefHat, 
  Utensils, 
  Coffee, 
  Refrigerator, 
  Car, 
  Wrench,
  Package,
  Home
} from "lucide-react";

const Categories = () => {
  const categories = [
    {
      icon: ChefHat,
      title: "Equipamiento Cocina",
      description: "Hornos, freidoras, planchas y todo el equipamiento profesional",
      itemCount: "2,500+ productos",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: Utensils,
      title: "Menaje y Vajilla",
      description: "Platos, cubiertos, cristalería y menaje profesional",
      itemCount: "3,200+ productos", 
      gradient: "from-blue-500 to-purple-500"
    },
    {
      icon: Coffee,
      title: "Bebidas y Café",
      description: "Cafeteras, máquinas de bebidas y suministros",
      itemCount: "1,800+ productos",
      gradient: "from-amber-500 to-orange-500"
    },
    {
      icon: Refrigerator,
      title: "Refrigeración",
      description: "Cámaras frigoríficas, congeladores y equipos de frío",
      itemCount: "1,200+ productos",
      gradient: "from-cyan-500 to-blue-500"
    },
    {
      icon: Package,
      title: "Ingredientes",
      description: "Productos frescos, congelados y despensa al por mayor",
      itemCount: "5,000+ productos",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Home,
      title: "Mobiliario",
      description: "Mesas, sillas, decoración y mobiliario para hostelería",
      itemCount: "1,500+ productos",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Wrench,
      title: "Mantenimiento",
      description: "Herramientas, productos de limpieza y mantenimiento",
      itemCount: "900+ productos",
      gradient: "from-gray-500 to-slate-600"
    },
    {
      icon: Car,
      title: "Delivery y Logística",
      description: "Soluciones de entrega, packaging y logística",
      itemCount: "600+ productos",
      gradient: "from-indigo-500 to-blue-600"
    }
  ];

  return (
    <section id="marketplace" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
            Explora nuestras 
            <span className="text-orange-500 bg-orange-100 px-3 py-1 rounded-lg"> categorías</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Encuentra exactamente lo que necesitas para tu negocio hostelero. 
            Desde equipamiento profesional hasta ingredientes frescos.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <div 
              key={index}
              className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer overflow-hidden border-2 border-transparent hover:border-orange-200"
            >
              {/* Background gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              <div className="relative z-10">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center mb-4 group-hover:animate-bounce`}>
                  <category.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold text-blue-900 mb-2 group-hover:text-orange-600 transition-colors">
                  {category.title}
                </h3>
                
                <p className="text-muted-foreground text-sm mb-3 leading-relaxed">
                  {category.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                    {category.itemCount}
                  </span>
                  <span className="text-orange-500 text-sm font-medium group-hover:translate-x-1 transition-transform hover:text-orange-600">
                    Ver más →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Featured Suppliers */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Proveedores destacados
            </h3>
            <p className="text-lg text-muted-foreground">
              Trabaja con las mejores marcas del sector
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-card p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center opacity-60">
              {/* Placeholder logos - would be replaced with actual supplier logos */}
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center justify-center">
                  <div className="w-24 h-12 bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      Proveedor {i}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Categories;
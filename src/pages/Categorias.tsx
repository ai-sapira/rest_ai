import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigationTransition, pageTransitionVariants, cardVariants } from "@/hooks/useNavigationTransition";
import { useAnunciosSimple } from "@/hooks/useAnunciosSimple";
import { AnuncioCard } from "@/components/AnuncioCard";
import { contratarConfig, matchesUnifiedType, getUnifiedTypeColor, getUnifiedTypeLabel } from "@/lib/contratarConfig";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  ChevronRight,
  Wrench,
  Sofa,
  Utensils,
  Package,
  Wine,
  Truck,
  UserCheck,
  Filter,
  X,
  Search
} from "lucide-react";

// Category configurations matching the sidebar structure
interface CategoryConfig {
  key: string;
  name: string;
  icon: any;
  color: string;
  gradient: string;
  description: string;
}

// Categories configuration matching the actual pages with correct icons
const categories: CategoryConfig[] = [
  {
    key: "maquinaria",
    name: "Maquinaria",
    icon: Wrench,  // Corrected to match sidebar and intended use
    color: "text-repsol-orange",
    gradient: "from-repsol-blue to-repsol-orange",
    description: "Equipamiento y maquinaria profesional"
  },
  {
    key: "mobiliario",
    name: "Mobiliario",
    icon: Sofa,
    color: "text-repsol-orange",
    gradient: "from-repsol-blue to-repsol-orange",
    description: "Muebles y decoración para hostelería"
  },
  {
    key: "utensilios",
    name: "Utensilios",
    icon: Utensils,
    color: "text-repsol-orange",
    gradient: "from-repsol-blue to-repsol-orange",
    description: "Herramientas y utensilios de cocina"
  },
  {
    key: "menaje",
    name: "Menaje",
    icon: Package,
    color: "text-repsol-orange",
    gradient: "from-repsol-blue to-repsol-orange",
    description: "Vajilla, cristalería y mantelería"
  },
  {
    key: "bodega",
    name: "Bodega",
    icon: Wine,
    color: "text-repsol-orange",
    gradient: "from-repsol-blue to-repsol-orange",
    description: "Vinos, licores y bebidas"
  },
  {
    key: "aprovisionamientos",
    name: "Aprovisionamientos",
    icon: Truck,
    color: "text-repsol-orange",
    gradient: "from-repsol-blue to-repsol-orange",
    description: "Ingredientes y suministros"
  },
  {
    key: "servicios",
    name: "Servicios",
    icon: UserCheck,
    color: "text-repsol-orange",
    gradient: "from-repsol-blue to-repsol-orange",
    description: "Servicios profesionales"
  }
];

export default function Categorias() {
  // Initialize navigation transition
  const { navigateWithDelay } = useNavigationTransition();
  
  // Get real data from database
  const { anuncios, loading, error, refresh } = useAnunciosSimple();

  // Filters state - comprehensive filtering
  const [priceFilter, setPriceFilter] = useState("todos");
  const [locationFilter, setLocationFilter] = useState("todos");
  const [conditionFilter, setConditionFilter] = useState("todos");
  const [typeFilter, setTypeFilter] = useState("todos");

  // Complete filter configuration
  const filterConfig = {
    priceRanges: [
      { id: 'hasta_500', label: 'Hasta 500€', test: (price: number) => price <= 500 },
      { id: '500_1000', label: '500€ - 1.000€', test: (price: number) => price >= 500 && price <= 1000 },
      { id: '1000_5000', label: '1.000€ - 5.000€', test: (price: number) => price >= 1000 && price <= 5000 },
      { id: 'mas_5000', label: 'Más de 5.000€', test: (price: number) => price > 5000 }
    ],
    locations: [
      { id: 'madrid', label: 'Madrid' },
      { id: 'barcelona', label: 'Barcelona' },
      { id: 'valencia', label: 'Valencia' },
      { id: 'sevilla', label: 'Sevilla' },
      { id: 'bilbao', label: 'Bilbao' },
      { id: 'otras', label: 'Otras ubicaciones' }
    ],
    conditions: [
      { id: 'nuevo', label: 'Nuevo' },
      { id: 'como_nuevo', label: 'Como nuevo' },
      { id: 'buen_estado', label: 'Buen estado' },
      { id: 'usado', label: 'Usado' },
      { id: 'para_reparar', label: 'Para reparar' }
    ],
    types: [
      { id: 'venta', label: 'Venta' },
      { id: 'compra', label: 'Compra' },
      { id: 'alquiler', label: 'Alquiler' },
      { id: 'servicio', label: 'Servicio' }
    ]
  };

  // Apply filters to anuncios
  const filteredAnuncios = anuncios.filter(anuncio => {
    // Price filter
    const matchesPrice = priceFilter === "todos" || 
      (anuncio.precio != null && filterConfig.priceRanges.some(r => 
        r.id === priceFilter && r.test ? r.test(parseInt(anuncio.precio.toString())) : true
      ));
    
    // Location filter
    const matchesLocation = locationFilter === "todos" || locationFilter === "otras" ||
      (typeof anuncio.ubicacion === 'string' 
        ? anuncio.ubicacion.toLowerCase().includes(locationFilter.toLowerCase())
        : anuncio.ubicacion?.region?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    
    // Condition filter
    const matchesCondition = conditionFilter === "todos" || 
      (anuncio.estado_producto && anuncio.estado_producto.toLowerCase().replace(/\s+/g, '_').includes(conditionFilter.toLowerCase()));
    
    // Type filter using unified matching
    const matchesType = typeFilter === "todos" || 
      matchesUnifiedType(typeFilter as any, anuncio.tipo || (anuncio.actor_type === 'provider' ? 'oferta' : 'vendo'));

    return matchesPrice && matchesLocation && matchesCondition && matchesType;
  });

  const getConditionColor = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'nuevo': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'como nuevo': return 'bg-green-100 text-green-800 border-green-200';
      case 'buen estado': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'usado': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'para reparar': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const clearFilters = () => {
    setPriceFilter("todos");
    setLocationFilter("todos");
    setConditionFilter("todos");
    setTypeFilter("todos");
  };

  // Group anuncios by category
  const getAnunciosByCategory = (categoryKey: string) => {
    return filteredAnuncios.filter(anuncio => 
      anuncio.categoria.toLowerCase() === categoryKey.toLowerCase()
    );
  };

  return (
    <motion.main 
      className="flex-1 p-6"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransitionVariants}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Modern Filters */}
        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-repsol-blue rounded-lg shadow-md">
                    <Filter className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
                    <p className="text-sm text-gray-600">{filteredAnuncios.length} de {anuncios.length} anuncios</p>
                  </div>
                </div>
                {(priceFilter !== "todos" || locationFilter !== "todos" || conditionFilter !== "todos" || typeFilter !== "todos") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-2"
                  >
                    <X className="h-4 w-4" />
                    Limpiar filtros
                  </Button>
                )}
              </div>

              {/* Filters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Price Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Precio</label>
                  <Select value={priceFilter} onValueChange={setPriceFilter}>
                    <SelectTrigger className="h-10 bg-white border-gray-300 focus:border-repsol-blue focus:ring-repsol-blue">
                      <SelectValue placeholder="Todos los precios" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los precios</SelectItem>
                      {filterConfig.priceRanges.map((range) => (
                        <SelectItem key={range.id} value={range.id}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Ubicación</label>
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger className="h-10 bg-white border-gray-300 focus:border-repsol-blue focus:ring-repsol-blue">
                      <SelectValue placeholder="Todas las ubicaciones" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas las ubicaciones</SelectItem>
                      {filterConfig.locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Condition Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Estado</label>
                  <Select value={conditionFilter} onValueChange={setConditionFilter}>
                    <SelectTrigger className="h-10 bg-white border-gray-300 focus:border-repsol-blue focus:ring-repsol-blue">
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los estados</SelectItem>
                      {filterConfig.conditions.map((condition) => (
                        <SelectItem key={condition.id} value={condition.id}>
                          {condition.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Type Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Tipo</label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="h-10 bg-white border-gray-300 focus:border-repsol-blue focus:ring-repsol-blue">
                      <SelectValue placeholder="Todos los tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los tipos</SelectItem>
                      {filterConfig.types.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Active filters display */}
              {(priceFilter !== "todos" || locationFilter !== "todos" || conditionFilter !== "todos" || typeFilter !== "todos") && (
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <span className="text-sm text-gray-600">Filtros activos:</span>
                  <div className="flex flex-wrap gap-2">
                    {priceFilter !== "todos" && (
                      <Badge variant="secondary" className="bg-repsol-blue/10 text-repsol-blue border-repsol-blue/20">
                        {filterConfig.priceRanges.find(r => r.id === priceFilter)?.label}
                      </Badge>
                    )}
                    {locationFilter !== "todos" && (
                      <Badge variant="secondary" className="bg-repsol-blue/10 text-repsol-blue border-repsol-blue/20">
                        {filterConfig.locations.find(l => l.id === locationFilter)?.label}
                      </Badge>
                    )}
                    {conditionFilter !== "todos" && (
                      <Badge variant="secondary" className="bg-repsol-blue/10 text-repsol-blue border-repsol-blue/20">
                        {filterConfig.conditions.find(c => c.id === conditionFilter)?.label}
                      </Badge>
                    )}
                    {typeFilter !== "todos" && (
                      <Badge variant="secondary" className="bg-repsol-orange/10 text-repsol-orange border-repsol-orange/20">
                        {filterConfig.types.find(t => t.id === typeFilter)?.label}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-6 w-6 text-red-600 mx-auto mb-2" />
              <p className="text-red-600 mb-2">Error cargando los anuncios: {error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refresh}
                className="text-red-600 border-red-300 hover:bg-red-100"
              >
                Reintentar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-8">
            {categories.map((category) => (
              <div key={category.key} className="space-y-4">
                  <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div>
                    <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4 space-y-3">
                        <div className="aspect-video bg-gray-200 rounded"></div>
                        <div className="space-y-2">
                          <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                          <div className="h-3 w-full bg-gray-200 rounded"></div>
                            </div>
                        <div className="flex justify-between">
                          <div className="h-6 w-20 bg-gray-200 rounded"></div>
                          <div className="h-8 w-24 bg-gray-200 rounded"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Categories with Anuncios */}
        {!loading && !error && (
          <div className="space-y-8">
            {categories.map((category) => {
              const categoryAnuncios = getAnunciosByCategory(category.key);
              
              if (categoryAnuncios.length === 0) return null;

              return (
                <motion.div
                  key={category.key}
                  variants={cardVariants}
                  initial="initial"
                  animate="animate"
                  className="space-y-4"
                >
                  {/* Category Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${category.gradient} flex items-center justify-center shadow-md`}>
                        <category.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">{category.name}</h2>
                        <p className="text-sm text-gray-600">
                          {categoryAnuncios.length} anuncios disponibles
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-1 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                      onClick={() => navigateWithDelay(`/platform/contratar/${category.key}`)}
                    >
                      Ver todos
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Anuncios Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categoryAnuncios.slice(0, 8).map((anuncio) => (
                      <AnuncioCard
                        key={anuncio.id}
                        anuncio={anuncio}
                        getTypeColor={getUnifiedTypeColor}
                        getTypeLabel={getUnifiedTypeLabel}
                        getConditionColor={getConditionColor}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                  
                  {/* Show More Button */}
                  {categoryAnuncios.length > 8 && (
                    <div className="text-center pt-4">
                      <Button 
                        variant="outline" 
                        className="gap-2 border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300"
                        onClick={() => navigateWithDelay(`/platform/contratar/${category.key}`)}
                      >
                        Ver más anuncios de {category.name}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                </motion.div>
            );
          })}
        </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredAnuncios.length === 0 && (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No se encontraron anuncios
              </h3>
              <p className="text-gray-600 max-w-sm mb-4">
                {anuncios.length === 0 
                  ? "No hay anuncios disponibles en este momento."
                  : "Intenta ajustar los filtros para ver más resultados."
                }
              </p>
              {anuncios.length > 0 && (
                <Button variant="outline" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </motion.main>
  );
}
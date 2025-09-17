import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigationTransition, pageTransitionVariants } from "@/hooks/useNavigationTransition";
import { useAnunciosSimple, type Anuncio } from "@/hooks/useAnunciosSimple";
import { AnuncioCard } from "./AnuncioCard";
import { CategoryFilters } from "./CategoryFilters";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Package } from "lucide-react";
import { getAllowedTypesForCategory, type ContratarCategoryKey } from "@/lib/contratarConfig";

// ✅ FIXED: Interface that matches contratarConfig structure
interface RawCategoryConfig {
  priceRanges: Array<{ id: string; label: string; test?: (price: number) => boolean }>;
  conditionOptions: string[];
  subcategories: string[];
}

interface CategoryPageProps {
  categoryName: string;
  categoryKey: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  config: RawCategoryConfig;
  getTypeColor: (tipo: string) => string;
  getTypeLabel: (tipo: string) => string;
  getConditionColor: (estado: string) => string;
  matchesUnifiedType?: (typeFilter: string, anuncioType: string) => boolean;
}

export function CategoryPage({
  categoryName,
  categoryKey,
  title,
  description,
  icon: IconComponent,
  config: rawConfig,
  getTypeColor,
  getTypeLabel,
  getConditionColor,
  matchesUnifiedType = () => true
}: CategoryPageProps) {
  // Initialize navigation transition (even if not used, keeps consistency)
  const { navigateWithDelay } = useNavigationTransition();
  
  // ✅ FIXED: Transform raw config to expected format with safe defaults
  const config = {
    priceRanges: rawConfig?.priceRanges || [],
    locations: [
      { id: 'madrid', label: 'Madrid' },
      { id: 'barcelona', label: 'Barcelona' },
      { id: 'valencia', label: 'Valencia' },
      { id: 'sevilla', label: 'Sevilla' },
      { id: 'bilbao', label: 'Bilbao' },
    ],
    conditions: (rawConfig?.conditionOptions || []).map(condition => ({
      id: condition.toLowerCase().replace(/\s+/g, '_'),
      label: condition
    })),
    types: getAllowedTypesForCategory(categoryKey as ContratarCategoryKey),
    subcategories: (rawConfig?.subcategories || []).map(sub => ({
      id: sub.toLowerCase().replace(/\s+/g, '_'),
      label: sub
    }))
  };

  // Filters state
  const [priceFilter, setPriceFilter] = useState("todos");
  const [locationFilter, setLocationFilter] = useState("todos");
  const [conditionFilter, setConditionFilter] = useState("todos");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [subcategoryFilter, setSubcategoryFilter] = useState("todos");

  // Get data with React Query
  const { anuncios, loading, error, refresh } = useAnunciosSimple();

  // Filter anuncios for this category
  const categoryAnuncios = anuncios.filter(anuncio => 
    anuncio.categoria.toLowerCase() === categoryKey.toLowerCase()
  );

  // Apply client-side filters
  const filteredAnuncios = categoryAnuncios.filter(anuncio => {
    const matchesPrice = priceFilter === "todos" || 
      (anuncio.precio != null && config.priceRanges.some(r => 
        r.id === priceFilter && r.test ? r.test(parseInt(anuncio.precio.toString())) : true
      ));
    
    const matchesLocation = locationFilter === "todos" || 
      (typeof anuncio.ubicacion === 'string' 
        ? anuncio.ubicacion.toLowerCase().includes(locationFilter.toLowerCase())
        : anuncio.ubicacion?.region?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    
    const matchesCondition = conditionFilter === "todos" || 
      (anuncio.estado_producto && anuncio.estado_producto.toLowerCase().includes(conditionFilter.toLowerCase()));
    
    const matchesType = typeFilter === "todos" || 
      matchesUnifiedType(typeFilter as any, anuncio.tipo || (anuncio.actor_type === 'provider' ? 'oferta' : 'vendo'));

    const matchesSubcategory = subcategoryFilter === "todos" ||
      (anuncio.subcategoria && anuncio.subcategoria.toLowerCase().includes(subcategoryFilter.toLowerCase()));

    return matchesPrice && matchesLocation && matchesCondition && matchesType && matchesSubcategory;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const clearFilters = () => {
    setPriceFilter("todos");
    setLocationFilter("todos");
    setConditionFilter("todos");
    setTypeFilter("todos");
    setSubcategoryFilter("todos");
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
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <IconComponent className="h-8 w-8 text-repsol-orange" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              <p className="text-gray-600 mt-1">{description}</p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span>{categoryAnuncios.length} anuncios disponibles</span>
            <span>{filteredAnuncios.length} después de filtros</span>
          </div>
        </div>

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

        {/* Filters */}
        <CategoryFilters
          priceFilter={priceFilter}
          setPriceFilter={setPriceFilter}
          locationFilter={locationFilter}
          setLocationFilter={setLocationFilter}
          conditionFilter={conditionFilter}
          setConditionFilter={setConditionFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          subcategoryFilter={subcategoryFilter}
          setSubcategoryFilter={setSubcategoryFilter}
          onClearFilters={clearFilters}
          config={config}
        />

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <div className="h-5 w-16 bg-gray-200 rounded" />
                    <div className="h-6 w-20 bg-gray-200 rounded" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-3/4 bg-gray-200 rounded" />
                    <div className="h-3 w-full bg-gray-200 rounded" />
                  </div>
                  <div className="aspect-video bg-gray-200 rounded" />
                  <div className="flex justify-between">
                    <div className="h-3 w-1/3 bg-gray-200 rounded" />
                    <div className="h-3 w-1/4 bg-gray-200 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {filteredAnuncios.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAnuncios.map((anuncio) => (
                  <AnuncioCard
                    key={anuncio.id}
                    anuncio={anuncio}
                    getTypeColor={getTypeColor}
                    getTypeLabel={getTypeLabel}
                    getConditionColor={getConditionColor}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            ) : (
              /* Empty State */
              <Card className="border-dashed border-2 border-gray-300">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Package className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No se encontraron anuncios
                  </h3>
                  <p className="text-gray-600 max-w-sm mb-4">
                    {categoryAnuncios.length === 0 
                      ? `No hay anuncios disponibles en la categoría ${categoryName}.`
                      : "Intenta ajustar los filtros para ver más resultados."
                    }
                  </p>
                  {categoryAnuncios.length > 0 && (
                    <Button variant="outline" onClick={clearFilters}>
                      Limpiar filtros
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </motion.main>
  );
}

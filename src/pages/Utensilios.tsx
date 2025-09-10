import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  MapPin,
  Eye,
  MessageCircle,
  X,
  Filter,
  Truck,
  Utensils
} from "lucide-react";
import { useAnuncios, type Anuncio } from "@/hooks/useAnuncios";

export default function Utensilios() {
  const navigate = useNavigate();
  const { anuncios, loading } = useAnuncios();
  
  // Filter anuncios for utensilios category
  const utensiliosAnuncios = anuncios.filter(anuncio => 
    anuncio.categoria.toLowerCase() === 'utensilios'
  );

  // Filters state
  const [priceFilter, setPriceFilter] = useState("todos");
  const [locationFilter, setLocationFilter] = useState("todos");
  const [conditionFilter, setConditionFilter] = useState("todos");
  const [typeFilter, setTypeFilter] = useState("todos");

  // Apply filters
  const filteredAnuncios = utensiliosAnuncios.filter(anuncio => {
    const matchesPrice = priceFilter === "todos" || 
      (priceFilter === "bajo" && anuncio.precio && parseInt(anuncio.precio) < 300) ||
      (priceFilter === "medio" && anuncio.precio && parseInt(anuncio.precio) >= 300 && parseInt(anuncio.precio) <= 800) ||
      (priceFilter === "alto" && anuncio.precio && parseInt(anuncio.precio) > 800);
    
    const matchesLocation = locationFilter === "todos" || 
      anuncio.ubicacion.region.toLowerCase().includes(locationFilter.toLowerCase());
    
    const matchesCondition = conditionFilter === "todos" || 
      (anuncio.estado_producto && anuncio.estado_producto.toLowerCase().includes(conditionFilter.toLowerCase()));
    
    const matchesType = typeFilter === "todos" || anuncio.tipo === typeFilter;

    return matchesPrice && matchesLocation && matchesCondition && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "vendo":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "busco":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "oferta":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  if (loading) {
    return (
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="space-y-4">
            <div className="h-8 w-48 bg-gray-200 animate-pulse rounded" />
            <div className="h-4 w-96 bg-gray-200 animate-pulse rounded" />
          </div>
          
          {/* Filters Skeleton */}
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 w-32 bg-gray-200 animate-pulse rounded" />
            ))}
          </div>
          
          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <Card key={i} className="h-80 animate-pulse">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <div className="flex gap-2">
                      <div className="h-6 w-16 bg-gray-200 rounded" />
                      <div className="h-6 w-16 bg-gray-200 rounded" />
                    </div>
                    <div className="h-6 w-20 bg-gray-200 rounded" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-5 w-full bg-gray-200 rounded" />
                    <div className="h-4 w-3/4 bg-gray-200 rounded" />
                  </div>
                  <div className="h-20 bg-gray-200 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Utensilios</h1>
          <p className="text-muted-foreground">
            Cuchillos, ollas, sartenes y todo lo necesario para tu cocina profesional
          </p>
          <div className="text-sm text-muted-foreground">
            {filteredAnuncios.length} anuncios disponibles
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-auto min-w-32">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="vendo">Vendo</SelectItem>
              <SelectItem value="busco">Busco</SelectItem>
              <SelectItem value="oferta">Oferta</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priceFilter} onValueChange={setPriceFilter}>
            <SelectTrigger className="w-auto min-w-32">
              <SelectValue placeholder="Precio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los precios</SelectItem>
              <SelectItem value="bajo">Menos de €300</SelectItem>
              <SelectItem value="medio">€300 - €800</SelectItem>
              <SelectItem value="alto">Más de €800</SelectItem>
            </SelectContent>
          </Select>

          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-auto min-w-32">
              <SelectValue placeholder="Ubicación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas las ubicaciones</SelectItem>
              <SelectItem value="madrid">Madrid</SelectItem>
              <SelectItem value="barcelona">Barcelona</SelectItem>
              <SelectItem value="valencia">Valencia</SelectItem>
              <SelectItem value="sevilla">Sevilla</SelectItem>
            </SelectContent>
          </Select>

          <Select value={conditionFilter} onValueChange={setConditionFilter}>
            <SelectTrigger className="w-auto min-w-32">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="nuevo">Nuevo</SelectItem>
              <SelectItem value="como nuevo">Como nuevo</SelectItem>
              <SelectItem value="usado">Usado</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Más filtros
          </Button>
          
          {(priceFilter !== "todos" || locationFilter !== "todos" || conditionFilter !== "todos" || typeFilter !== "todos") && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setPriceFilter("todos");
                setLocationFilter("todos");
                setConditionFilter("todos");
                setTypeFilter("todos");
              }}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
              Limpiar filtros
            </Button>
          )}
        </div>

        {/* Results Grid */}
        {filteredAnuncios.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnuncios.map((anuncio) => (
              <Card 
                key={anuncio.id} 
                className="hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => navigate(`/platform/anuncios/${anuncio.id}`)}
              >
                <CardContent className="p-0">
                  {/* Image placeholder */}
                  <div className="aspect-video bg-gray-100 rounded-t-lg flex items-center justify-center">
                    {anuncio.imagenes && anuncio.imagenes.length > 0 ? (
                      <img 
                        src={anuncio.imagenes[0]} 
                        alt={anuncio.titulo}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    ) : (
                      <Utensils className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="p-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex gap-2">
                        <Badge variant="outline" className={getTypeColor(anuncio.tipo)}>
                          {anuncio.tipo.toUpperCase()}
                        </Badge>
                        {anuncio.estado_producto && (
                          <Badge variant="secondary" className="text-xs">
                            {anuncio.estado_producto}
                          </Badge>
                        )}
                      </div>
                      {anuncio.precio && (
                        <div className="text-lg font-bold text-primary">
                          €{parseInt(anuncio.precio).toLocaleString()}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div>
                      <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {anuncio.titulo}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {anuncio.descripcion}
                      </p>
                    </div>

                    {/* Details */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{anuncio.subcategoria}</span>
                        {anuncio.envio && (
                          <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                            <Truck className="h-3 w-3 mr-1" />
                            Envío
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{anuncio.ubicacion.city}, {anuncio.ubicacion.region}</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{anuncio.visualizaciones}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          <span>{anuncio.contactos}</span>
                        </div>
                      </div>
                      <span>{formatDate(anuncio.created_at)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Empty State */
          <Card>
            <CardContent className="p-8 text-center">
              <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No se encontraron anuncios</h3>
              <p className="text-muted-foreground">
                No hay anuncios de utensilios que coincidan con tus filtros
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setPriceFilter("todos");
                  setLocationFilter("todos");
                  setConditionFilter("todos");
                  setTypeFilter("todos");
                }}
              >
                Limpiar filtros
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
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
  UserCheck,
  Clock,
  Star
} from "lucide-react";
import { useAnuncios, type Anuncio } from "@/hooks/useAnuncios";

export default function Servicios() {
  const navigate = useNavigate();
  const { anuncios, loading } = useAnuncios();
  
  // Filter anuncios for servicios category
  const serviciosAnuncios = anuncios.filter(anuncio => 
    anuncio.categoria.toLowerCase() === 'servicios'
  );

  // Filters state
  const [locationFilter, setLocationFilter] = useState("todos");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [subcategoryFilter, setSubcategoryFilter] = useState("todos");
  const [experienceFilter, setExperienceFilter] = useState("todos");

  // Apply filters
  const filteredAnuncios = serviciosAnuncios.filter(anuncio => {
    const matchesLocation = locationFilter === "todos" || 
      anuncio.ubicacion.region.toLowerCase().includes(locationFilter.toLowerCase());
    
    const matchesType = typeFilter === "todos" || anuncio.tipo === typeFilter;
    
    const matchesSubcategory = subcategoryFilter === "todos" || 
      anuncio.subcategoria.toLowerCase().includes(subcategoryFilter.toLowerCase());
      
    const matchesExperience = experienceFilter === "todos" ||
      (experienceFilter === "junior" && anuncio.experiencia_anos && anuncio.experiencia_anos < 3) ||
      (experienceFilter === "mid" && anuncio.experiencia_anos && anuncio.experiencia_anos >= 3 && anuncio.experiencia_anos <= 7) ||
      (experienceFilter === "senior" && anuncio.experiencia_anos && anuncio.experiencia_anos > 7);

    return matchesLocation && matchesType && matchesSubcategory && matchesExperience;
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
              <Card key={i} className="h-96 animate-pulse">
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
          <h1 className="text-3xl font-bold">Servicios Profesionales</h1>
          <p className="text-muted-foreground">
            Encuentra personal cualificado para tu restaurante
          </p>
          <div className="text-sm text-muted-foreground">
            {filteredAnuncios.length} profesionales disponibles
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
              <SelectItem value="busco">Busco personal</SelectItem>
              <SelectItem value="oferta">Ofrezco servicios</SelectItem>
            </SelectContent>
          </Select>

          <Select value={subcategoryFilter} onValueChange={setSubcategoryFilter}>
            <SelectTrigger className="w-auto min-w-40">
              <SelectValue placeholder="Especialidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas las especialidades</SelectItem>
              <SelectItem value="chef">Chef / Cocinero</SelectItem>
              <SelectItem value="camarero">Camarero / Mesero</SelectItem>
              <SelectItem value="barista">Barista</SelectItem>
              <SelectItem value="sommelier">Sommelier</SelectItem>
              <SelectItem value="ayudante">Ayudante de cocina</SelectItem>
            </SelectContent>
          </Select>

          <Select value={experienceFilter} onValueChange={setExperienceFilter}>
            <SelectTrigger className="w-auto min-w-32">
              <SelectValue placeholder="Experiencia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Cualquier nivel</SelectItem>
              <SelectItem value="junior">0-3 años</SelectItem>
              <SelectItem value="mid">3-7 años</SelectItem>
              <SelectItem value="senior">Más de 7 años</SelectItem>
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

          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Más filtros
          </Button>
          
          {(locationFilter !== "todos" || typeFilter !== "todos" || subcategoryFilter !== "todos" || experienceFilter !== "todos") && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setLocationFilter("todos");
                setTypeFilter("todos");
                setSubcategoryFilter("todos");
                setExperienceFilter("todos");
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
                  {/* Profile section */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-t-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                        <UserCheck className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors line-clamp-1">
                          {anuncio.titulo}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {anuncio.subcategoria}
                        </p>
                        {anuncio.experiencia_anos && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="text-xs text-gray-500">
                              {anuncio.experiencia_anos} años exp.
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex gap-2">
                        <Badge variant="outline" className={getTypeColor(anuncio.tipo)}>
                          {anuncio.tipo.toUpperCase()}
                        </Badge>
                        {anuncio.disponibilidad && (
                          <Badge variant="secondary" className="text-xs">
                            {anuncio.disponibilidad}
                          </Badge>
                        )}
                      </div>
                      {anuncio.salario_min && anuncio.salario_max && (
                        <div className="text-right">
                          <div className="text-sm font-bold text-primary">
                            €{parseInt(anuncio.salario_min)} - €{parseInt(anuncio.salario_max)}
                          </div>
                          <div className="text-xs text-gray-500">
                            /{anuncio.tipo_salario || 'hora'}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {anuncio.descripcion}
                      </p>
                    </div>

                    {/* Specialties */}
                    {anuncio.especialidades && anuncio.especialidades.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-gray-700">Especialidades:</div>
                        <div className="flex flex-wrap gap-1">
                          {anuncio.especialidades.slice(0, 3).map((esp, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {esp}
                            </Badge>
                          ))}
                          {anuncio.especialidades.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{anuncio.especialidades.length - 3} más
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Location and Schedule */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{anuncio.ubicacion.city}, {anuncio.ubicacion.region}</span>
                      </div>
                      {anuncio.disponibilidad_horario && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>Horario flexible</span>
                        </div>
                      )}
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
              <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No se encontraron profesionales</h3>
              <p className="text-muted-foreground">
                No hay servicios que coincidan con tus filtros
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setLocationFilter("todos");
                  setTypeFilter("todos");
                  setSubcategoryFilter("todos");
                  setExperienceFilter("todos");
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
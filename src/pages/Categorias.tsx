import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAnuncios, type Anuncio } from "@/hooks/useAnuncios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  MapPin,
  Clock,
  Users,
  AlertTriangle,
  TrendingUp,
  Star,
  Euro,
  Filter,
  ChevronRight,
  Wrench,
  Sofa,
  Utensils,
  Package,
  Wine,
  Truck,
  UserCheck,
  Eye,
  MessageCircle,
  Grid,
  List,
  X
} from "lucide-react";

interface CategorySummary {
  name: string;
  icon: any;
  totalAnnouncements: number;
  urgentCount: number;
  averagePrice: string;
  topLocation: string;
  recentActivity: string;
  color: string;
}

// Map categories to match database format and create dynamic summaries
const getCategorySummaries = (anuncios: Anuncio[]): CategorySummary[] => {
  const categoriesMap = [
    { name: "maquinaria", displayName: "Maquinaria", icon: Wrench, color: "from-blue-500 to-blue-600" },
    { name: "servicios", displayName: "Servicios", icon: UserCheck, color: "from-green-500 to-green-600" },
    { name: "mobiliario", displayName: "Mobiliario", icon: Sofa, color: "from-purple-500 to-purple-600" },
    { name: "aprovisionamientos", displayName: "Aprovisionamientos", icon: Truck, color: "from-orange-500 to-orange-600" },
    { name: "utensilios", displayName: "Utensilios", icon: Utensils, color: "from-red-500 to-red-600" },
    { name: "bodega", displayName: "Bodega", icon: Wine, color: "from-indigo-500 to-indigo-600" },
    { name: "menaje", displayName: "Menaje", icon: Package, color: "from-teal-500 to-teal-600" }
  ];

  return categoriesMap.map(cat => {
    const categoryAnuncios = anuncios.filter(a => a.categoria.toLowerCase() === cat.name);
    const totalAnnouncements = categoryAnuncios.length;
    const averagePrice = categoryAnuncios.length > 0 
      ? `€${Math.round(categoryAnuncios.reduce((sum, a) => sum + (parseInt(a.precio) || 0), 0) / categoryAnuncios.length).toLocaleString()}`
      : "€0";
    
    return {
      name: cat.displayName,
      icon: cat.icon,
      totalAnnouncements,
      urgentCount: 0, // Would need urgency field in schema
      averagePrice,
      topLocation: "Madrid", // Would need location aggregation
      recentActivity: "hace 1 hora", // Would need timestamp calculation
      color: cat.color
    };
  }).filter(cat => cat.totalAnnouncements > 0);
};

export default function Categorias() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todas");
  const [distanceFilter, setDistanceFilter] = useState("todas");
  const [networkFilter, setNetworkFilter] = useState("todas");
  const [urgencyFilter, setUrgencyFilter] = useState("todas");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Get real data from Supabase
  const { anuncios, loading } = useAnuncios();
  
  // Get dynamic category summaries based on real data
  const categorySummaries = getCategorySummaries(anuncios);

  const filteredAnnouncements = anuncios.filter(anuncio => {
    const matchesSearch = anuncio.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         anuncio.descripcion.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "todas" || anuncio.categoria.toLowerCase() === selectedCategory.toLowerCase();
    // Note: Distance filtering would need user location - simplified for now
    const matchesDistance = distanceFilter === "todas"; 
    // Note: Network filtering would need user relationships - simplified for now
    const matchesNetwork = networkFilter === "todas";
    // Note: Urgency would need to be added to anuncio schema - simplified for now
    const matchesUrgency = urgencyFilter === "todas";
    
    return matchesSearch && matchesCategory && matchesDistance && matchesNetwork && matchesUrgency;
  });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "alta":
        return "bg-red-100 text-red-800 border-red-200";
      case "media":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "baja":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

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

  const getAnnouncementsByCategory = (categoryName: string) => {
    return filteredAnnouncements.filter(anuncio => anuncio.categoria.toLowerCase() === categoryName.toLowerCase());
  };

  return (
    <main className="flex-1 p-6 overflow-hidden">
      <div className="w-full space-y-8">

        {/* Filters */}
        <div className="flex flex-wrap gap-3 justify-center items-center py-4">
          <Select value={distanceFilter} onValueChange={setDistanceFilter}>
            <SelectTrigger className="w-auto min-w-36">
              <MapPin className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Distancia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Cualquier distancia</SelectItem>
              <SelectItem value="5km">Hasta 5 km</SelectItem>
              <SelectItem value="10km">Hasta 10 km</SelectItem>
              <SelectItem value="20km">Hasta 20 km</SelectItem>
            </SelectContent>
          </Select>

          <Select value={networkFilter} onValueChange={setNetworkFilter}>
            <SelectTrigger className="w-auto min-w-36">
              <Users className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Red" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todos los usuarios</SelectItem>
              <SelectItem value="red">Solo mi red</SelectItem>
            </SelectContent>
          </Select>

          <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
            <SelectTrigger className="w-auto min-w-36">
              <Clock className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Urgencia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="media">Media</SelectItem>
              <SelectItem value="baja">Baja</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Más filtros
          </Button>
          
          {(searchQuery || distanceFilter !== "todas" || networkFilter !== "todas" || urgencyFilter !== "todas") && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setDistanceFilter("todas");
                setNetworkFilter("todas");
                setUrgencyFilter("todas");
              }}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
              Limpiar filtros
            </Button>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-5 w-32 bg-gray-200 animate-pulse rounded" />
                    <div className="h-3 w-24 bg-gray-200 animate-pulse rounded" />
                  </div>
                </div>
                <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                  {Array.from({ length: 4 }).map((_, j) => (
                    <Card key={j} className="h-64 animate-pulse">
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
                        <div className="h-12 bg-gray-200 rounded" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Categories with Horizontal Scroll */
          <div className="space-y-8">
            {categorySummaries.map((category) => {
              const categoryAnnouncements = getAnnouncementsByCategory(category.name);
              
              if (categoryAnnouncements.length === 0) return null;

            return (
              <div key={category.name} className="space-y-4">
                {/* Category Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                      <category.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">{category.name}</h2>
                      <p className="text-sm text-muted-foreground">
                        {categoryAnnouncements.length} anuncios • {category.urgentCount} urgentes
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-1">
                    Ver todos
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Auto-fit Single Row Grid */}
                <div className="grid gap-4 pb-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                  {categoryAnnouncements.map((anuncio) => (
                    <Card 
                      key={anuncio.id} 
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate(`/platform/anuncios/${anuncio.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex gap-2">
                              <Badge 
                                variant="outline" 
                                className={getTypeColor(anuncio.tipo)}
                              >
                                {anuncio.tipo.toUpperCase()}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className="bg-green-100 text-green-800 border-green-200"
                              >
                                {anuncio.estado.toUpperCase()}
                              </Badge>
                            </div>
                            {anuncio.precio && (
                              <div className="text-lg font-bold text-primary">
                                €{parseInt(anuncio.precio).toLocaleString()}
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div>
                            <h3 className="font-semibold mb-2 line-clamp-1">{anuncio.titulo}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {anuncio.descripcion}
                            </p>
                          </div>

                          {/* Location and Details */}
                          <div className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{anuncio.subcategoria}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {anuncio.ubicacion.city}, {anuncio.ubicacion.region}
                              </p>
                            </div>
                            {anuncio.envio && (
                              <Badge variant="outline" className="text-blue-600 border-blue-200">
                                <Truck className="h-3 w-3" />
                              </Badge>
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
                              {anuncio.estado_producto && (
                                <div className="flex items-center gap-1">
                                  <span>{anuncio.estado_producto}</span>
                                </div>
                              )}
                            </div>
                            <span>{new Date(anuncio.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {/* Show More Button */}
                {categoryAnnouncements.length > 4 && (
                  <div className="text-center pt-4">
                    <Button variant="outline" className="gap-2">
                      Ver más anuncios de {category.name}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        )}

        {/* Empty State */}
        {!loading && filteredAnnouncements.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No se encontraron anuncios</h3>
              <p className="text-muted-foreground">
                Prueba a ajustar los filtros o amplia tu área de búsqueda
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigationTransition, pageTransitionVariants, cardVariants } from "@/hooks/useNavigationTransition";
import { useAnunciosSimple } from "@/hooks/useAnunciosSimple";
import { AnuncioCard } from "@/components/AnuncioCard";
import { CategoryFilters } from "@/components/CategoryFilters";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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

// Category configurations matching the sidebar structure
interface CategoryConfig {
  key: string;
  name: string;
  icon: any;
  color: string;
  gradient: string;
  description: string;
}

// Categories configuration matching the sidebar structure
const categories: CategoryConfig[] = [
  {
    key: "maquinaria",
    name: "Maquinaria",
    icon: Wrench,
    color: "text-repsol-blue",
    gradient: "from-blue-500 to-indigo-500",
    description: "Equipamiento y maquinaria profesional"
  },
  {
    key: "mobiliario",
    name: "Mobiliario",
    icon: Sofa,
    color: "text-repsol-blue",
    gradient: "from-green-500 to-emerald-500",
    description: "Muebles y decoración para hostelería"
  },
  {
    key: "utensilios",
    name: "Utensilios",
    icon: Utensils,
    color: "text-repsol-blue",
    gradient: "from-orange-500 to-red-500",
    description: "Herramientas y utensilios de cocina"
  },
  {
    key: "menaje",
    name: "Menaje",
    icon: Package,
    color: "text-repsol-blue",
    gradient: "from-purple-500 to-pink-500",
    description: "Vajilla, cristalería y mantelería"
  },
  {
    key: "bodega",
    name: "Bodega",
    icon: Wine,
    color: "text-repsol-blue",
    gradient: "from-red-500 to-rose-500",
    description: "Vinos, licores y bebidas"
  },
  {
    key: "aprovisionamientos",
    name: "Aprovisionamientos",
    icon: Truck,
    color: "text-repsol-blue",
    gradient: "from-indigo-500 to-blue-500",
    description: "Ingredientes y suministros"
  },
  {
    key: "servicios",
    name: "Servicios",
    icon: UserCheck,
    color: "text-repsol-blue",
    gradient: "from-emerald-500 to-green-500",
    description: "Servicios profesionales"
  }
];

export default function Categorias() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todas");
  const [distanceFilter, setDistanceFilter] = useState("todas");
  const [networkFilter, setNetworkFilter] = useState("todas");
  const [urgencyFilter, setUrgencyFilter] = useState("todas");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredAnnouncements = mockAnnouncements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         announcement.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "todas" || announcement.category === selectedCategory;
    const matchesDistance = distanceFilter === "todas" || 
                           (distanceFilter === "5km" && announcement.distance <= 5) ||
                           (distanceFilter === "10km" && announcement.distance <= 10) ||
                           (distanceFilter === "20km" && announcement.distance <= 20);
    const matchesNetwork = networkFilter === "todas" || 
                          (networkFilter === "red" && announcement.user.isInNetwork);
    const matchesUrgency = urgencyFilter === "todas" || announcement.urgency === urgencyFilter;
    
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
    return filteredAnnouncements.filter(announcement => announcement.category === categoryName);
  };

  return (
    <main className="flex-1 p-6 overflow-hidden">
      <div className="w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Explorar Categorías</h1>
          <p className="text-muted-foreground">
            Encuentra productos, servicios y personal para tu restaurante
          </p>
        </div>

        {/* Enhanced Filters */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Enhanced Search Bar - Navbar Style */}
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center bg-muted rounded-lg px-4 py-3">
                  <Search className="w-4 h-4 text-muted-foreground mr-2" />
                  <input 
                    type="text" 
                    placeholder="Buscar productos, servicios, personal..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none flex-1 text-sm"
                  />
                </div>
                
                {/* Search Suggestions */}
                {searchQuery && (
                  <div className="mt-2 border border-border rounded-lg bg-background">
                    <div className="p-2">
                      <div className="text-xs font-medium text-muted-foreground mb-2">Sugerencias</div>
                      <div className="space-y-1">
                        <button 
                          onClick={() => setSearchQuery("maquinaria cocina")}
                          className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded flex items-center gap-2"
                        >
                          <Search className="h-3 w-3 text-muted-foreground" />
                          maquinaria cocina
                        </button>
                        <button 
                          onClick={() => setSearchQuery("chef temporal")}
                          className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded flex items-center gap-2"
                        >
                          <Search className="h-3 w-3 text-muted-foreground" />
                          chef temporal
                        </button>
                        <button 
                          onClick={() => setSearchQuery("mobiliario restaurante")}
                          className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded flex items-center gap-2"
                        >
                          <Search className="h-3 w-3 text-muted-foreground" />
                          mobiliario restaurante
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Filter Controls */}
              <div className="flex flex-wrap gap-3 justify-center">
                <Select value={distanceFilter} onValueChange={setDistanceFilter}>
                  <SelectTrigger className="w-auto min-w-32">
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
                  <SelectTrigger className="w-auto min-w-32">
                    <Users className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Red" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todos los usuarios</SelectItem>
                    <SelectItem value="red">Solo mi red</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                  <SelectTrigger className="w-auto min-w-32">
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
            </div>
          </CardContent>
        </Card>

        {/* Categories with Horizontal Scroll */}
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
                  {categoryAnnouncements.map((announcement) => (
                    <Card key={announcement.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex gap-2">
                              <Badge 
                                variant="outline" 
                                className={getTypeColor(announcement.type)}
                              >
                                {announcement.type.toUpperCase()}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={getUrgencyColor(announcement.urgency)}
                              >
                                {announcement.urgency.toUpperCase()}
                              </Badge>
                            </div>
                            {announcement.price && (
                              <div className="text-lg font-bold text-primary">
                                {announcement.price}
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div>
                            <h3 className="font-semibold mb-2 line-clamp-1">{announcement.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {announcement.description}
                            </p>
                          </div>

                          {/* User Info */}
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={announcement.user.avatar} alt={announcement.user.name} />
                              <AvatarFallback>
                                {announcement.user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{announcement.user.name}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {announcement.user.restaurant}
                              </p>
                            </div>
                            {announcement.user.isInNetwork && (
                              <Badge variant="outline" className="text-blue-600 border-blue-200">
                                <Users className="h-3 w-3" />
                              </Badge>
                            )}
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>{announcement.distance}km</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                <span>{announcement.views}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageCircle className="h-3 w-3" />
                                <span>{announcement.responses}</span>
                              </div>
                            </div>
                            <span>{announcement.createdAt}</span>
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

        {/* Empty State */}
        {filteredAnnouncements.length === 0 && (
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
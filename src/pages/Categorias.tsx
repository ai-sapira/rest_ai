import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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

interface Announcement {
  id: string;
  title: string;
  category: string;
  type: "vendo" | "busco" | "oferta";
  description: string;
  price?: string;
  location: string;
  distance: number;
  urgency: "alta" | "media" | "baja";
  user: {
    name: string;
    restaurant: string;
    avatar: string;
    isInNetwork: boolean;
    rating: number;
  };
  createdAt: string;
  views: number;
  responses: number;
  status: "activo" | "pausado" | "finalizado";
}

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

const mockAnnouncements: Announcement[] = [
  // Maquinaria
  {
    id: "1",
    title: "Horno Industrial Rational - Excelente estado",
    category: "Maquinaria",
    type: "vendo",
    description: "Horno combi steam Rational SelfCookingCenter, 5 años de uso, mantenimiento al día.",
    price: "€8,500",
    location: "Madrid",
    distance: 2.3,
    urgency: "media",
    user: {
      name: "Carlos Martín",
      restaurant: "Asador El Roble",
      avatar: "/avatars/carlos.jpg",
      isInNetwork: true,
      rating: 4.8
    },
    createdAt: "hace 2 días",
    views: 156,
    responses: 12,
    status: "activo"
  },
  {
    id: "7",
    title: "Freidora industrial BERTO - Como nueva",
    category: "Maquinaria",
    type: "vendo",
    description: "Freidora de 40 litros, apenas usada. Perfecto estado, con filtrado automático.",
    price: "€3,200",
    location: "Barcelona",
    distance: 8.1,
    urgency: "baja",
    user: {
      name: "Miguel Torres",
      restaurant: "Tapas del Mar",
      avatar: "/avatars/miguel.jpg",
      isInNetwork: false,
      rating: 4.6
    },
    createdAt: "hace 4 días",
    views: 89,
    responses: 5,
    status: "activo"
  },
  {
    id: "8",
    title: "Plancha industrial 80cm - Urgente",
    category: "Maquinaria",
    type: "vendo",
    description: "Plancha de acero inoxidable, 80cm. Cierre de local, debe irse esta semana.",
    price: "€1,800",
    location: "Valencia",
    distance: 12.5,
    urgency: "alta",
    user: {
      name: "Laura Jiménez",
      restaurant: "Grill Express",
      avatar: "/avatars/laura.jpg",
      isInNetwork: true,
      rating: 4.7
    },
    createdAt: "hace 1 día",
    views: 234,
    responses: 18,
    status: "activo"
  },
  {
    id: "9",
    title: "Lavavajillas industrial Hobart",
    category: "Maquinaria",
    type: "vendo",
    description: "Lavavajillas de paso, muy poco uso. Incluye kit de instalación.",
    price: "€4,500",
    location: "Sevilla",
    distance: 6.8,
    urgency: "media",
    user: {
      name: "Antonio Ruiz",
      restaurant: "Casa Antonio",
      avatar: "/avatars/antonio.jpg",
      isInNetwork: true,
      rating: 4.9
    },
    createdAt: "hace 3 días",
    views: 112,
    responses: 8,
    status: "activo"
  },

  // Personal
  {
    id: "2",
    title: "URGENTE: Chef especializado en cocina japonesa",
    category: "Personal",
    type: "busco",
    description: "Para cubrir puesto permanente en restaurante japonés en centro de Madrid. Experiencia mínima 3 años.",
    location: "Madrid Centro",
    distance: 1.2,
    urgency: "alta",
    user: {
      name: "Ana Takeshi",
      restaurant: "Sakura Sushi",
      avatar: "/avatars/ana.jpg",
      isInNetwork: false,
      rating: 4.9
    },
    createdAt: "hace 1 día",
    views: 234,
    responses: 18,
    status: "activo"
  },
  {
    id: "10",
    title: "Camarero/a con experiencia - Tiempo parcial",
    category: "Personal",
    type: "busco",
    description: "Buscamos camarero/a para fines de semana. Ambiente familiar, buen ambiente.",
    location: "Barcelona",
    distance: 4.2,
    urgency: "media",
    user: {
      name: "Carmen López",
      restaurant: "Bistró Carmen",
      avatar: "/avatars/carmen.jpg",
      isInNetwork: true,
      rating: 4.5
    },
    createdAt: "hace 2 días",
    views: 156,
    responses: 14,
    status: "activo"
  },
  {
    id: "11",
    title: "Cocinero para pizzería - Incorporación inmediata",
    category: "Personal",
    type: "busco",
    description: "Experiencia en masas y horno de leña. Contrato indefinido desde el primer día.",
    location: "Valencia",
    distance: 7.3,
    urgency: "alta",
    user: {
      name: "Giuseppe Rossi",
      restaurant: "Pizzeria Napoli",
      avatar: "/avatars/giuseppe.jpg",
      isInNetwork: false,
      rating: 4.8
    },
    createdAt: "hace 1 día",
    views: 189,
    responses: 22,
    status: "activo"
  },
  {
    id: "12",
    title: "Ayudante de cocina - Formación incluida",
    category: "Personal",
    type: "busco",
    description: "No se requiere experiencia previa. Ofrecemos formación completa y crecimiento profesional.",
    location: "Madrid",
    distance: 3.1,
    urgency: "baja",
    user: {
      name: "Francisco Martín",
      restaurant: "El Rincón Gastronómico",
      avatar: "/avatars/francisco.jpg",
      isInNetwork: true,
      rating: 4.6
    },
    createdAt: "hace 5 días",
    views: 98,
    responses: 11,
    status: "activo"
  },

  // Mobiliario
  {
    id: "3",
    title: "Mesas y sillas para terraza - Lote completo",
    category: "Mobiliario",
    type: "vendo",
    description: "30 mesas y 120 sillas de terraza, resistentes al clima. Perfecto estado.",
    price: "€2,400",
    location: "Valencia",
    distance: 15.6,
    urgency: "baja",
    user: {
      name: "Roberto Silva",
      restaurant: "La Terraza del Mar",
      avatar: "/avatars/roberto.jpg",
      isInNetwork: true,
      rating: 4.6
    },
    createdAt: "hace 5 días",
    views: 89,
    responses: 7,
    status: "activo"
  },
  {
    id: "13",
    title: "Bancos de madera rústicos - 20 unidades",
    category: "Mobiliario",
    type: "vendo",
    description: "Bancos artesanales de madera maciza. Perfectos para ambiente rural o terraza.",
    price: "€800",
    location: "Sevilla",
    distance: 9.4,
    urgency: "media",
    user: {
      name: "José María Pérez",
      restaurant: "El Cortijo",
      avatar: "/avatars/josemaria.jpg",
      isInNetwork: false,
      rating: 4.4
    },
    createdAt: "hace 3 días",
    views: 67,
    responses: 4,
    status: "activo"
  },
  {
    id: "14",
    title: "Barra de bar completa con taburetes",
    category: "Mobiliario",
    type: "vendo",
    description: "Barra de 4 metros con 12 taburetes a juego. Madera noble con acabado barnizado.",
    price: "€1,600",
    location: "Madrid",
    distance: 5.8,
    urgency: "baja",
    user: {
      name: "Patricia Vega",
      restaurant: "Bar Central",
      avatar: "/avatars/patricia.jpg",
      isInNetwork: true,
      rating: 4.7
    },
    createdAt: "hace 6 días",
    views: 134,
    responses: 9,
    status: "activo"
  },

  // Aprovisionamientos
  {
    id: "4",
    title: "Proveedor de mariscos frescos - Descuento especial",
    category: "Aprovisionamientos",
    type: "oferta",
    description: "Distribuidor directo de Galicia. 20% descuento en primer pedido para nuevos clientes.",
    location: "Valencia",
    distance: 8.4,
    urgency: "media",
    user: {
      name: "María González",
      restaurant: "Mariscos El Puerto",
      avatar: "/avatars/maria.jpg",
      isInNetwork: true,
      rating: 4.7
    },
    createdAt: "hace 3 días",
    views: 178,
    responses: 25,
    status: "activo"
  },
  {
    id: "15",
    title: "Verduras ecológicas km0 - Entrega diaria",
    category: "Aprovisionamientos",
    type: "oferta",
    description: "Productos de nuestra propia huerta. Entrega diaria en Barcelona y alrededores.",
    location: "Barcelona",
    distance: 11.2,
    urgency: "baja",
    user: {
      name: "Jordi Mas",
      restaurant: "Huerta Ecológica Jordi",
      avatar: "/avatars/jordi.jpg",
      isInNetwork: false,
      rating: 4.8
    },
    createdAt: "hace 2 días",
    views: 145,
    responses: 16,
    status: "activo"
  },
  {
    id: "16",
    title: "Carnes premium de Ávila - Distribuidor oficial",
    category: "Aprovisionamientos",
    type: "oferta",
    description: "Ternera de Ávila IGP y Cochinillo de Segovia. Calidad superior garantizada.",
    location: "Madrid",
    distance: 2.9,
    urgency: "media",
    user: {
      name: "Alberto Sánchez",
      restaurant: "Carnes Selectas Alberto",
      avatar: "/avatars/alberto.jpg",
      isInNetwork: true,
      rating: 4.9
    },
    createdAt: "hace 4 días",
    views: 198,
    responses: 31,
    status: "activo"
  },
  {
    id: "17",
    title: "Pescado fresco de lonja - Entrega nocturna",
    category: "Aprovisionamientos",
    type: "oferta",
    description: "Pescado directo de lonja de Valencia. Entrega nocturna para máxima frescura.",
    location: "Valencia",
    distance: 1.5,
    urgency: "alta",
    user: {
      name: "Ricardo Mar",
      restaurant: "Pescados Ricardo",
      avatar: "/avatars/ricardo.jpg",
      isInNetwork: true,
      rating: 4.6
    },
    createdAt: "hace 1 día",
    views: 267,
    responses: 28,
    status: "activo"
  },

  // Utensilios
  {
    id: "5",
    title: "Utensilios de cocina profesional - Lote completo",
    category: "Utensilios",
    type: "vendo",
    description: "Cuchillos, sartenes, ollas industriales. Cierre de restaurante, todo debe ir.",
    price: "€1,200",
    location: "Madrid",
    distance: 5.1,
    urgency: "alta",
    user: {
      name: "Elena Vega",
      restaurant: "Bistró Moderno",
      avatar: "/avatars/elena.jpg",
      isInNetwork: false,
      rating: 4.5
    },
    createdAt: "hace 1 día",
    views: 267,
    responses: 31,
    status: "activo"
  },
  {
    id: "18",
    title: "Set de cuchillos profesionales Wüsthof",
    category: "Utensilios",
    type: "vendo",
    description: "Juego completo de cuchillos alemanes, muy poco uso. Incluye soporte magnético.",
    price: "€450",
    location: "Barcelona",
    distance: 6.7,
    urgency: "media",
    user: {
      name: "Chef Daniel",
      restaurant: "Cocina de Autor",
      avatar: "/avatars/daniel.jpg",
      isInNetwork: true,
      rating: 4.8
    },
    createdAt: "hace 3 días",
    views: 123,
    responses: 15,
    status: "activo"
  },
  {
    id: "19",
    title: "Ollas de acero inoxidable - Lote de 15",
    category: "Utensilios",
    type: "vendo",
    description: "Ollas industriales de diferentes tamaños. Acero inoxidable 18/10, muy resistentes.",
    price: "€680",
    location: "Sevilla",
    distance: 14.3,
    urgency: "baja",
    user: {
      name: "Remedios Castro",
      restaurant: "La Cocina de Remedios",
      avatar: "/avatars/remedios.jpg",
      isInNetwork: false,
      rating: 4.5
    },
    createdAt: "hace 4 días",
    views: 78,
    responses: 6,
    status: "activo"
  },

  // Bodega
  {
    id: "6",
    title: "Selección de vinos premium - Bodega completa",
    category: "Bodega",
    type: "vendo",
    description: "200 botellas de vinos selectos, perfectas para carta de alta gama.",
    price: "€4,800",
    location: "Barcelona",
    distance: 12.8,
    urgency: "media",
    user: {
      name: "David Fernández",
      restaurant: "Vinoteca Selecta",
      avatar: "/avatars/david.jpg",
      isInNetwork: true,
      rating: 4.8
    },
    createdAt: "hace 4 días",
    views: 134,
    responses: 15,
    status: "activo"
  },
  {
    id: "20",
    title: "Champagne Dom Pérignon - 12 botellas",
    category: "Bodega",
    type: "vendo",
    description: "Champagne de lujo, añada 2010. Perfectas para eventos especiales.",
    price: "€2,400",
    location: "Madrid",
    distance: 3.4,
    urgency: "baja",
    user: {
      name: "Sommelier Carlos",
      restaurant: "Restaurante Gourmet",
      avatar: "/avatars/sommelier.jpg",
      isInNetwork: true,
      rating: 4.9
    },
    createdAt: "hace 2 días",
    views: 156,
    responses: 12,
    status: "activo"
  },
  {
    id: "21",
    title: "Cava artesanal catalán - Producción propia",
    category: "Bodega",
    type: "oferta",
    description: "Cava de producción familiar, métodos tradicionales. Descuento por compra al por mayor.",
    location: "Barcelona",
    distance: 18.9,
    urgency: "media",
    user: {
      name: "Familia Codorníu",
      restaurant: "Cava Familiar",
      avatar: "/avatars/codorniu.jpg",
      isInNetwork: false,
      rating: 4.7
    },
    createdAt: "hace 5 días",
    views: 98,
    responses: 8,
    status: "activo"
  },
  {
    id: "22",
    title: "Vinos de Rioja - Lote de 50 botellas",
    category: "Bodega",
    type: "vendo",
    description: "Selección de vinos tintos de Rioja, diferentes añadas y bodegas reconocidas.",
    price: "€1,250",
    location: "Valencia",
    distance: 9.6,
    urgency: "baja",
    user: {
      name: "Enrique Viñas",
      restaurant: "Taberna del Vino",
      avatar: "/avatars/enrique.jpg",
      isInNetwork: true,
      rating: 4.6
    },
    createdAt: "hace 6 días",
    views: 112,
    responses: 10,
    status: "activo"
  }
];

const categorySummaries: CategorySummary[] = [
  {
    name: "Maquinaria",
    icon: Wrench,
    totalAnnouncements: 45,
    urgentCount: 8,
    averagePrice: "€3,200",
    topLocation: "Madrid",
    recentActivity: "hace 2 horas",
    color: "from-repsol-blue to-repsol-orange"
  },
  {
    name: "Personal",
    icon: UserCheck,
    totalAnnouncements: 67,
    urgentCount: 15,
    averagePrice: "€1,800/mes",
    topLocation: "Barcelona",
    recentActivity: "hace 1 hora",
    color: "from-green-500 to-green-600"
  },
  {
    name: "Mobiliario",
    icon: Sofa,
    totalAnnouncements: 32,
    urgentCount: 4,
    averagePrice: "€850",
    topLocation: "Valencia",
    recentActivity: "hace 3 horas",
    color: "from-purple-500 to-purple-600"
  },
  {
    name: "Aprovisionamientos",
    icon: Truck,
    totalAnnouncements: 89,
    urgentCount: 12,
    averagePrice: "€450",
    topLocation: "Madrid",
    recentActivity: "hace 30 min",
    color: "from-orange-500 to-orange-600"
  },
  {
    name: "Utensilios",
    icon: Utensils,
    totalAnnouncements: 28,
    urgentCount: 6,
    averagePrice: "€290",
    topLocation: "Sevilla",
    recentActivity: "hace 1 hora",
    color: "from-red-500 to-red-600"
  },
  {
    name: "Bodega",
    icon: Wine,
    totalAnnouncements: 21,
    urgentCount: 3,
    averagePrice: "€1,400",
    topLocation: "Barcelona",
    recentActivity: "hace 2 horas",
    color: "from-indigo-500 to-indigo-600"
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
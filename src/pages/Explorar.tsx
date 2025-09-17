import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { pageTransitionVariants, cardVariants } from "@/hooks/useNavigationTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  TrendingUp,
  Users,
  Star,
  MapPin,
  Clock,
  Eye,
  MessageCircle,
  Heart,
  Share2,
  Hash,
  Compass,
  Filter,
  Grid,
  List,
  ChefHat,
  Wrench,
  Sofa,
  Utensils,
  Package,
  Wine,
  Truck,
  UserCheck,
  ShoppingCart,
  Zap,
  Crown,
  Award,
  Target,
  Flame,
  Coffee,
  ChevronRight,
  Plus,
  ArrowRight,
  BarChart3,
  Sparkles,
  TrendingDown
} from "lucide-react";
import { useCommunitiesBasic } from "@/hooks/useCommunitiesBasic";
import { useCommunities } from "@/hooks/useCommunities";
import { usePostsSimple } from "@/hooks/usePostsSimple";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

interface TrendingTopic {
  id: string;
  name: string;
  postsCount: number;
  growth: number;
  category: string;
}

interface FeaturedCommunity {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  avatar: string;
  isJoined: boolean;
  category: string;
  trending: boolean;
}

interface ExploreCategory {
  id: string;
  name: string;
  icon: any;
  color: string;
  gradient: string;
  description: string;
  count: number;
  trending?: boolean;
}

// Add custom CSS for horizontal scrolling
const customStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;

export default function Explorar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("todos");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedTopic, setSelectedTopic] = useState<string>("all"); // Topic filter state
  
  // Real data hooks - using single unified hook
  const { userCommunities, allCommunities, loading: communitiesLoading, refresh } = useCommunities();
  const { posts, loading: postsLoading } = usePostsSimple();

  // Topic filters with categories for community filtering
  const topicFilters = [
    { id: "all", name: "Todos", count: 142 },
    { id: "gastronomia", name: "Gastronomía", count: 45 },
    { id: "equipamiento", name: "Equipamiento", count: 32 },
    { id: "gestion", name: "Gestión", count: 28 },
    { id: "tendencias", name: "Tendencias", count: 18 },
    { id: "sostenibilidad", name: "Sostenibilidad", count: 12 },
    { id: "marketing", name: "Marketing", count: 15 },
    { id: "tecnologia", name: "Tecnología", count: 22 },
    { id: "eventos", name: "Eventos", count: 8 },
  ];

  // Mock trending topics
  const trendingTopics: TrendingTopic[] = [
    { id: "1", name: "feriahotelgastronomia", postsCount: 156, growth: 32, category: "eventos" },
    { id: "2", name: "sostenibilidad", postsCount: 89, growth: 28, category: "tendencias" },
    { id: "3", name: "nuevasnormativas", postsCount: 67, growth: 45, category: "legal" },
    { id: "4", name: "preciosenergia", postsCount: 234, growth: 18, category: "economia" },
    { id: "5", name: "equipamientobarato", postsCount: 345, growth: 52, category: "compras" },
    { id: "6", name: "tecnicascocina", postsCount: 123, growth: 25, category: "gastronomia" },
    { id: "7", name: "marketingrestaurante", postsCount: 78, growth: 33, category: "marketing" },
    { id: "8", name: "recursoshumanos", postsCount: 91, growth: 22, category: "personal" },
  ];

  // Explore categories - Updated to match sidebar routes with Repsol blue
  const exploreCategories: ExploreCategory[] = [
    {
      id: "maquinaria",
      name: "Maquinaria",
      icon: Wrench,
      color: "text-repsol-blue",
      gradient: "from-blue-500 to-indigo-500",
      description: "Equipamiento y maquinaria profesional",
      count: 1850,
      trending: true
    },
    {
      id: "mobiliario",
      name: "Mobiliario",
      icon: Sofa,
      color: "text-repsol-blue",
      gradient: "from-green-500 to-emerald-500",
      description: "Muebles y decoración para hostelería",
      count: 920,
    },
    {
      id: "utensilios",
      name: "Utensilios",
      icon: Utensils,
      color: "text-repsol-blue",
      gradient: "from-orange-500 to-red-500",
      description: "Herramientas y utensilios de cocina",
      count: 1240,
    },
    {
      id: "menaje",
      name: "Menaje",
      icon: Package,
      color: "text-repsol-blue",
      gradient: "from-purple-500 to-pink-500",
      description: "Vajilla, cristalería y mantelería",
      count: 980,
    },
    {
      id: "bodega",
      name: "Bodega",
      icon: Wine,
      color: "text-repsol-blue",
      gradient: "from-red-500 to-rose-500",
      description: "Vinos, licores y bebidas",
      count: 650,
    },
    {
      id: "aprovisionamientos",
      name: "Aprovisionamientos",
      icon: Truck,
      color: "text-repsol-blue",
      gradient: "from-indigo-500 to-blue-500",
      description: "Ingredientes y suministros",
      count: 1560,
      trending: true
    }
  ];

  // Mock featured communities (will be replaced with real data)
  const featuredCommunities: FeaturedCommunity[] = [
    {
      id: "cocineros-profesionales",
      name: "Cocineros Profesionales",
      description: "Comunidad de chefs y cocineros compartiendo técnicas, recetas y experiencias del mundo gastronómico",
      memberCount: 2400,
      avatar: "👨‍🍳",
      isJoined: false,
      category: "gastronomia",
      trending: true
    },
    {
      id: "gestion-restaurantes",
      name: "Gestión de Restaurantes",
      description: "Estrategias de administración, finanzas y operaciones para propietarios y gerentes",
      memberCount: 1800,
      avatar: "📊",
      isJoined: true,
      category: "gestion",
      trending: false
    },
    {
      id: "equipamiento-cocina",
      name: "Equipamiento de Cocina",
      description: "Reviews, comparativas y consejos sobre maquinaria y herramientas profesionales",
      memberCount: 987,
      avatar: "🔧",
      isJoined: false,
      category: "equipamiento",
      trending: true
    },
    {
      id: "sostenibilidad-hosteleria",
      name: "Sostenibilidad en Hostelería",
      description: "Prácticas eco-friendly, reducción de desperdicios y responsabilidad ambiental",
      memberCount: 654,
      avatar: "🌱",
      isJoined: false,
      category: "tendencias",
      trending: true
    },
    {
      id: "bartenders-profesionales",
      name: "Bartenders Profesionales",
      description: "Coctelería creativa, técnicas de bar y tendencias en bebidas",
      memberCount: 1200,
      avatar: "🍸",
      isJoined: false,
      category: "gastronomia",
      trending: false
    },
    {
      id: "pasteleria-reposteria",
      name: "Pastelería y Repostería",
      description: "Arte dulce, técnicas avanzadas y decoración profesional",
      memberCount: 890,
      avatar: "🧁",
      isJoined: false,
      category: "gastronomia",
      trending: false
    }
  ];

  // Add more communities to the array
  const expandedCommunities: FeaturedCommunity[] = [
    ...featuredCommunities,
    {
      id: "mobiliario-diseno",
      name: "Mobiliario y Diseño",
      description: "Decoración, mobiliario y diseño de espacios para restaurantes y hoteles",
      memberCount: 1450,
      avatar: "🪑",
      isJoined: false,
      category: "equipamiento",
      trending: false
    },
    {
      id: "tecnologia-pos",
      name: "Tecnología y POS",
      description: "Sistemas de punto de venta, apps y tecnología para la hostelería",
      memberCount: 892,
      avatar: "💻",
      isJoined: false,
      category: "tecnologia",
      trending: true
    },
    {
      id: "eventos-networking",
      name: "Eventos y Networking",
      description: "Ferias, congresos y eventos del sector hostelero para networking",
      memberCount: 567,
      avatar: "🤝",
      isJoined: true,
      category: "eventos",
      trending: false
    },
    {
      id: "formacion-profesional",
      name: "Formación Profesional",
      description: "Cursos, certificaciones y desarrollo profesional en hostelería",
      memberCount: 2100,
      avatar: "🎓",
      isJoined: false,
      category: "gestion",
      trending: false
    },
    {
      id: "delivery-takeaway",
      name: "Delivery y Takeaway",
      description: "Optimización de servicios de entrega y comida para llevar",
      memberCount: 934,
      avatar: "🚗",
      isJoined: false,
      category: "tecnologia",
      trending: true
    },
    {
      id: "seguridad-alimentaria",
      name: "Seguridad Alimentaria",
      description: "APPCC, normativas sanitarias y seguridad en la manipulación de alimentos",
      memberCount: 1680,
      avatar: "🛡️",
      isJoined: true,
      category: "sostenibilidad",
      trending: false
    }
  ];

  // Filter communities based on selected topic and search query
  const filteredCommunities = allCommunities.filter(community => {
    // First filter by search query
    const matchesSearch = searchQuery === "" || 
      community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (community.description && community.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;
    
    // Then filter by topic
    if (selectedTopic === "all") return true;
    
    // Map topic filter to community categories
    const topicMap: { [key: string]: string[] } = {
      gastronomia: ['cocina', 'chef', 'gastronomia', 'cocinero'],
      equipamiento: ['maquinaria', 'equipo', 'herramientas'],
      gestion: ['administracion', 'gestion', 'gerencia'],
      tecnologia: ['pos', 'tech', 'digital'],
      // Add more mappings as needed
    };
    
    const keywords = topicMap[selectedTopic] || [selectedTopic];
    return keywords.some(keyword => 
      community.name.toLowerCase().includes(keyword) ||
      (community.description && community.description.toLowerCase().includes(keyword))
    );
  });

  // Handle follow/unfollow community
  const handleFollowCommunity = async (communityId: string) => {
    if (!user) {
      console.log('No user logged in');
      return;
    }

    try {
      // Check if user is already a member
      const isCurrentlyMember = userCommunities.some(mc => mc.id === communityId);

      if (isCurrentlyMember) {
        // Leave community
        const { error } = await supabase
          .from('community_members')
          .delete()
          .eq('user_id', user.id)
          .eq('community_id', communityId);

        if (error) throw error;

        // Update member count
        const { error: rpcError } = await supabase.rpc('decrement_community_members', { community_id: communityId });
        if (rpcError) console.warn('RPC decrement error:', rpcError);
      } else {
        // Join community
        const { error } = await supabase
          .from('community_members')
          .insert({
            user_id: user.id,
            community_id: communityId
          });

        if (error) throw error;

        // Update member count
        const { error: rpcError } = await supabase.rpc('increment_community_members', { community_id: communityId });
        if (rpcError) console.warn('RPC increment error:', rpcError);
      }

      // Refresh data
      await Promise.all([
        refetchAll(),
        refetchMine()
      ]);

    } catch (error) {
      console.error('Error following/unfollowing community:', error);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <>
      <style>{customStyles}</style>
      <motion.main 
        className="flex-1 bg-background"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransitionVariants}
      >
        {/* Modern Header */}
        <div className="sticky top-14 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-repsol-blue rounded-lg shadow-md">
                  <Compass className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Explorar</h1>
                  <p className="text-sm text-gray-600">Descubre comunidades y categorías</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Topic Filters - Optimized Style */}
        <div className="bg-white border-b border-gray-100">
          <div className="px-6 py-3">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                {topicFilters.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                      selectedTopic === topic.id
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'bg-gray-50 text-gray-700 hover:bg-orange-50 hover:text-orange-600 border border-gray-200'
                    }`}
                  >
                    <span>{topic.name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      selectedTopic === topic.id
                        ? 'bg-orange-400 text-orange-100'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {topic.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Layout - Siguiendo patrón de Community */}
        <div className="flex-1 bg-background">
          <div className="max-w-7xl mx-auto flex gap-6 p-6">
            
            {/* Main Content Column */}
            <div className="flex-1 min-w-0 space-y-6">
              
              {/* Featured Communities Section */}
              <motion.section
                variants={cardVariants}
                initial="initial"
                animate="animate"
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-repsol-blue rounded-lg shadow-md">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          Comunidades destacadas
                        </h2>
                        {selectedTopic !== "all" && (
                          <p className="text-sm text-gray-600">
                            {filteredCommunities.length} en {topicFilters.find(t => t.id === selectedTopic)?.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => navigate('/platform/mis-comunidades')}
                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                    >
                      Ver todas
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {communitiesLoading ? (
                      // Loading skeleton - Estilo mejorado
                      <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="bg-gray-50 rounded-lg p-4 animate-pulse">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                                <div className="flex-1">
                                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                                  <div className="h-3 bg-gray-300 rounded w-1/2 mb-1"></div>
                                  <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                                </div>
                              </div>
                              <div className="w-16 h-8 bg-gray-300 rounded-md"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : allCommunities.length === 0 ? (
                      // Empty state mejorado
                      <div className="text-center py-12 text-gray-500">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Users className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="font-medium text-gray-900 mb-1">No hay comunidades</h3>
                        <p className="text-sm">No se encontraron comunidades para mostrar</p>
                      </div>
                    ) : (
                      // Real communities data - Estilo moderno
                      allCommunities.slice(0, 6).map((community) => {
                        const isJoined = userCommunities.some(mc => mc.id === community.id);
                        return (
                          <motion.div
                            key={community.id}
                            variants={cardVariants}
                            className="group bg-gray-50 hover:bg-white rounded-lg p-4 hover:shadow-sm border border-transparent hover:border-gray-200 transition-all duration-200 cursor-pointer"
                            onClick={() => navigate(`/platform/comunidades/${community.slug}`)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
                                  {community.name[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-medium text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                                      {community.name}
                                    </h3>
                                    {community.member_count > 1000 && (
                                      <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                                        Popular
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 line-clamp-1 mb-1">
                                    {community.description || "Comunidad de hostelería"}
                                  </p>
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Users className="h-3 w-3" />
                                    <span>{formatNumber(community.member_count)} miembros</span>
                                  </div>
                                </div>
                              </div>
                              
                              <Button
                                size="sm"
                                variant={isJoined ? "default" : "outline"}
                                className={`ml-3 shrink-0 h-8 px-3 text-xs ${
                                  isJoined 
                                    ? "bg-orange-500 hover:bg-orange-600 text-white" 
                                    : "border-gray-300 text-gray-700 hover:border-orange-300 hover:text-orange-600"
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFollowCommunity(community.id);
                                }}
                              >
                                {isJoined ? "Unido" : "Unirse"}
                              </Button>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </div>
              </motion.section>
              
              {/* Categories Section - Estilo moderno */}
              <motion.section
                variants={cardVariants}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-repsol-blue rounded-lg shadow-md">
                      <Grid className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Categorías populares</h2>
                      <p className="text-sm text-gray-600">Explora por tipo de producto</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {exploreCategories.map((category) => {
                      const IconComponent = category.icon;
                      return (
                        <motion.div
                          key={category.id}
                          variants={cardVariants}
                          onClick={() => navigate(`/platform/contratar/${category.id}`)}
                          className={`group relative bg-gray-50 hover:bg-white rounded-lg p-4 hover:shadow-sm border border-transparent hover:border-gray-200 transition-all duration-200 cursor-pointer ${
                            category.trending 
                              ? 'ring-2 ring-orange-200 bg-orange-50/50' 
                              : ''
                          }`}
                        >
                          {category.trending && (
                            <div className="absolute -top-1 -right-1">
                              <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                <Flame className="h-3 w-3" />
                                <span>Trending</span>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                              category.trending 
                                ? 'bg-orange-100 group-hover:bg-orange-200' 
                                : 'bg-white group-hover:bg-gray-100'
                            }`}>
                              <IconComponent className={`h-5 w-5 ${category.color} group-hover:scale-110 group-hover:text-repsol-blue transition-all duration-200`} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">
                                {category.name}
                              </h3>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600">
                                  {formatNumber(category.count)} productos
                                </span>
                                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.section>
            </div>

            {/* Sidebar moderno - Estilo Community */}
            <div className="w-80 flex-shrink-0 hidden lg:block">
              <div className="sticky top-[calc(3.5rem+4rem)] max-h-[calc(100vh-8rem)] overflow-y-auto space-y-4">
                
                {/* Stats Card - Estilo moderno */}
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <div className="p-2 bg-repsol-blue rounded-full shadow-md">
                        <BarChart3 className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-gray-900">Estadísticas</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-repsol-blue rounded-full"></div>
                        <span className="text-sm text-gray-600">Comunidades activas</span>
                      </div>
                      <span className="font-semibold text-repsol-blue">142</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-repsol-blue rounded-full"></div>
                        <span className="text-sm text-gray-600">Posts esta semana</span>
                      </div>
                      <span className="font-semibold text-repsol-blue">1,234</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-repsol-blue rounded-full"></div>
                        <span className="text-sm text-gray-600">Nuevos miembros</span>
                      </div>
                      <span className="font-semibold text-repsol-blue">+89</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Trending Topics - Estilo moderno */}
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <div className="p-2 bg-repsol-blue rounded-full shadow-md">
                        <TrendingUp className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-gray-900">Trending</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {trendingTopics.slice(0, 5).map((topic, index) => (
                      <div key={topic.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-gray-200">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">#{topic.name}</p>
                          <p className="text-xs text-gray-500">{topic.postsCount} posts</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                          <TrendingUp className="h-3 w-3" />
                          <span>+{topic.growth}%</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Sugerencias personalizadas - Estilo Repsol */}
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white via-orange-50/30 to-blue-50/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <div className="p-2 bg-gradient-to-br from-repsol-blue to-repsol-orange rounded-full shadow-md">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-gray-900">Para ti</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100/80 border border-orange-200/60">
                      <div className="flex items-center gap-2 mb-2">
                        <ChefHat className="h-4 w-4 text-repsol-orange" />
                        <span className="text-sm font-medium text-repsol-blue">Explora gastronomía</span>
                      </div>
                      <p className="text-xs text-gray-700 mb-3">
                        Contenido culinario basado en tu actividad
                      </p>
                      <Button size="sm" variant="outline" className="text-xs h-7 w-full border-repsol-orange/30 text-repsol-orange hover:bg-repsol-orange hover:text-white transition-all duration-200">
                        Ver más
                      </Button>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50/60 to-blue-100/60 border border-blue-200/40">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-repsol-blue" />
                        <span className="text-sm font-medium text-repsol-blue">Únete a comunidades</span>
                      </div>
                      <p className="text-xs text-gray-700 mb-3">
                        Conecta con profesionales de tu área
                      </p>
                      <Button size="sm" variant="outline" className="text-xs h-7 w-full border-repsol-blue/30 text-repsol-blue hover:bg-repsol-blue hover:text-white transition-all duration-200">
                        Explorar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </motion.main>
    </>
  );
}

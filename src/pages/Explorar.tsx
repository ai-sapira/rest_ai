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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  BarChart3
} from "lucide-react";
import { useCommunitiesSimple } from "@/hooks/useCommunitiesSimple";
import { usePosts } from "@/hooks/usePosts";
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
  
  // Real data hooks
  const { allCommunities, myCommunities, loading: communitiesLoading, refetchAll, refetchMine } = useCommunitiesSimple();
  const { posts, loading: postsLoading } = usePosts();

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

  // Explore categories - Updated to match sidebar routes
  const exploreCategories: ExploreCategory[] = [
    {
      id: "maquinaria",
      name: "Maquinaria",
      icon: Wrench,
      color: "text-blue-600",
      gradient: "from-blue-500 to-indigo-500",
      description: "Equipamiento y maquinaria profesional",
      count: 1850,
      trending: true
    },
    {
      id: "mobiliario",
      name: "Mobiliario",
      icon: Sofa,
      color: "text-green-600",
      gradient: "from-green-500 to-emerald-500",
      description: "Muebles y decoración para hostelería",
      count: 920,
    },
    {
      id: "utensilios",
      name: "Utensilios",
      icon: Utensils,
      color: "text-orange-600",
      gradient: "from-orange-500 to-red-500",
      description: "Herramientas y utensilios de cocina",
      count: 1240,
    },
    {
      id: "menaje",
      name: "Menaje",
      icon: Package,
      color: "text-purple-600",
      gradient: "from-purple-500 to-pink-500",
      description: "Vajilla, cristalería y mantelería",
      count: 980,
    },
    {
      id: "bodega",
      name: "Bodega",
      icon: Wine,
      color: "text-red-600",
      gradient: "from-red-500 to-rose-500",
      description: "Vinos, licores y bebidas",
      count: 650,
    },
    {
      id: "aprovisionamientos",
      name: "Aprovisionamientos",
      icon: Truck,
      color: "text-indigo-600",
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

  // Filter communities based on selected topic
  const filteredCommunities = selectedTopic === "all" 
    ? expandedCommunities 
    : expandedCommunities.filter(community => community.category === selectedTopic);

  // Handle follow/unfollow community
  const handleFollowCommunity = async (communityId: string) => {
    if (!user) {
      console.log('No user logged in');
      return;
    }

    try {
      // Check if user is already a member
      const isCurrentlyMember = myCommunities.some(mc => mc.id === communityId);

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
        className="flex-1 bg-white min-h-screen"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransitionVariants}
      >
        <div className="max-w-7xl mx-auto">
        

        {/* Horizontal Topic Filters - Reddit Style */}
        <div className="px-6 py-4 bg-white border-b border-gray-100 pt-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
              {topicFilters.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    selectedTopic === topic.id
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <span>{topic.name}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    selectedTopic === topic.id
                      ? 'bg-gray-700 text-gray-200'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {topic.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content - Clean Layout */}
        <div className="px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Main Content Column */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Featured Communities - Clean Design */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-purple-500" />
                      <h2 className="text-xl font-semibold text-gray-900">
                        Comunidades destacadas
                        {selectedTopic !== "all" && (
                          <span className="text-sm font-normal text-gray-500 ml-2">
                            ({filteredCommunities.length} en {topicFilters.find(t => t.id === selectedTopic)?.name})
                          </span>
                        )}
                      </h2>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => navigate('/platform/mis-comunidades')}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      Ver todas
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {communitiesLoading ? (
                      // Loading skeleton
                      <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                                <div className="flex-1">
                                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                                  <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
                                  <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                                </div>
                              </div>
                              <div className="w-16 h-8 bg-gray-300 rounded"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : allCommunities.length === 0 ? (
                      // Empty state
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No se encontraron comunidades</p>
                      </div>
                    ) : (
                      // Real communities data
                      allCommunities.slice(0, 8).map((community) => {
                        const isJoined = myCommunities.some(mc => mc.id === community.id);
                        return (
                          <div
                            key={community.id}
                            className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-200 hover:shadow-sm transition-all duration-200 cursor-pointer"
                            onClick={() => navigate(`/platform/community/${community.slug}`)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center text-lg font-semibold text-blue-600">
                                  {community.name[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                      {community.name}
                                    </h3>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                                    {community.description || "Sin descripción"}
                                  </p>
                                  <span className="text-xs text-gray-500 font-medium">
                                    {formatNumber(community.member_count)} miembros
                                  </span>
                                </div>
                              </div>
                              
                              <Button
                                size="sm"
                                variant={isJoined ? "default" : "outline"}
                                className="ml-4 shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFollowCommunity(community.id);
                                }}
                              >
                                {isJoined ? "Unido" : "Unirse"}
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </section>

                {/* Categories Section - Clean Grid */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <Grid className="h-5 w-5 text-blue-500" />
                    <h2 className="text-xl font-semibold text-gray-900">Categorías populares</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {exploreCategories.map((category) => {
                      const IconComponent = category.icon;
                      return (
                        <div
                          key={category.id}
                          onClick={() => navigate(`/platform/contratar/${category.id}`)}
                          className={`group relative bg-white rounded-xl p-6 hover:shadow-sm transition-all duration-200 cursor-pointer ${
                            category.trending 
                              ? 'border-2 border-orange-400 hover:border-orange-500' 
                              : 'border border-gray-200 hover:border-blue-200'
                          }`}
                        >
                          
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                              <IconComponent className={`h-6 w-6 ${category.color} group-hover:text-blue-600 transition-colors`} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                {category.name}
                              </h3>
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {category.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500 font-medium">
                                  {formatNumber(category.count)} posts
                                </span>
                                {category.trending && (
                                  <span className="text-xs text-orange-600 font-medium">Trending</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>

              {/* Clean Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-6 space-y-6">
                  
                  {/* Stats Card */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Estadísticas</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Comunidades activas</span>
                        <span className="font-semibold text-blue-600">142</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Posts esta semana</span>
                        <span className="font-semibold text-green-600">1,234</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Nuevos miembros</span>
                        <span className="font-semibold text-purple-600">+89</span>
                      </div>
                    </div>
                  </div>

                  {/* Popular Topics */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Popular esta semana</h3>
                    <div className="space-y-3">
                      {trendingTopics.slice(0, 5).map((topic, index) => (
                        <div key={topic.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">#{topic.name}</p>
                            <p className="text-xs text-gray-500">{topic.postsCount} posts</p>
                          </div>
                          <span className="text-xs text-green-600 font-medium">+{topic.growth}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Personalized Suggestions */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Sugerencias para ti</h3>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <ChefHat className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">Explora gastronomía</span>
                        </div>
                        <p className="text-xs text-blue-700 mb-3">
                          Contenido culinario basado en tu actividad
                        </p>
                        <Button size="sm" variant="outline" className="text-xs h-7 w-full border-blue-200 text-blue-700 hover:bg-blue-100">
                          Ver más
                        </Button>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-900">Únete a comunidades</span>
                        </div>
                        <p className="text-xs text-green-700 mb-3">
                          Conecta con profesionales de tu área
                        </p>
                        <Button size="sm" variant="outline" className="text-xs h-7 w-full border-green-200 text-green-700 hover:bg-green-100">
                          Explorar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </motion.main>
    </>
  );
}

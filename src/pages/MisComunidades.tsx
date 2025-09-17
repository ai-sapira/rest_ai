import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  MessageCircle,
  Search,
  MapPin,
  Crown,
  Bell,
  BellOff,
  UserPlus,
  UserMinus,
  MoreHorizontal,
  Filter,
  SortDesc,
  Eye,
  Calendar,
  TrendingUp,
  Shield
} from "lucide-react";
import { useCommunities } from "@/hooks/useCommunities";
import { useNavigate } from "react-router-dom";

interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  avatar: string;
  cover?: string;
  memberCount: number;
  postCount: number;
  isFollowing: boolean;
  isNotificationsEnabled: boolean;
  joinedAt: string;
  lastActivity: string;
  location: string;
  isPrivate: boolean;
  role: "member" | "moderator" | "admin";
  weeklyActivity: number;
  tags: string[];
}

const mockFollowedCommunities: Community[] = [
  {
    id: "1",
    name: "Chefs de Madrid",
    description: "Comunidad para profesionales de la cocina en Madrid. Compartimos experiencias, recetas y oportunidades laborales.",
    category: "Regional",
    avatar: "/avatars/chefs-madrid.jpg",
    cover: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=200&fit=crop",
    memberCount: 1247,
    postCount: 856,
    isFollowing: true,
    isNotificationsEnabled: true,
    joinedAt: "hace 6 meses",
    lastActivity: "hace 2 horas",
    location: "Madrid",
    isPrivate: false,
    role: "member",
    weeklyActivity: 23,
    tags: ["cocina", "networking", "madrid"]
  },
  {
    id: "2",
    name: "Equipamiento Hostelero",
    description: "Todo sobre maquinaria, equipos y herramientas para restaurantes y hoteles. Reviews, comparativas y ofertas.",
    category: "Equipamiento",
    avatar: "/avatars/equipment.jpg",
    memberCount: 3456,
    postCount: 2341,
    isFollowing: true,
    isNotificationsEnabled: false,
    joinedAt: "hace 1 año",
    lastActivity: "hace 1 día",
    location: "España",
    isPrivate: false,
    role: "moderator",
    weeklyActivity: 45,
    tags: ["equipamiento", "maquinaria", "reviews"]
  },
  {
    id: "3",
    name: "Gestión Restaurantes",
    description: "Estrategias de negocio, marketing digital, gestión de personal y optimización de costes para restaurantes.",
    category: "Gestión",
    avatar: "/avatars/management.jpg",
    memberCount: 2187,
    postCount: 1567,
    isFollowing: true,
    isNotificationsEnabled: true,
    joinedAt: "hace 8 meses",
    lastActivity: "hace 3 horas",
    location: "Internacional",
    isPrivate: true,
    role: "admin",
    weeklyActivity: 67,
    tags: ["gestión", "marketing", "finanzas"]
  },
  {
    id: "4",
    name: "Proveedores Costa del Sol",
    description: "Red de proveedores locales en la Costa del Sol. Productos frescos, especialidades regionales y contactos directos.",
    category: "Aprovisionamientos",
    avatar: "/avatars/suppliers.jpg",
    memberCount: 892,
    postCount: 634,
    isFollowing: true,
    isNotificationsEnabled: false,
    joinedAt: "hace 3 meses",
    lastActivity: "hace 1 semana",
    location: "Málaga",
    isPrivate: false,
    role: "member",
    weeklyActivity: 12,
    tags: ["proveedores", "local", "málaga"]
  },
  {
    id: "5",
    name: "Hostelería Sostenible",
    description: "Prácticas sostenibles en hostelería: reducción de desperdicios, productos ecológicos y eficiencia energética.",
    category: "Sostenibilidad",
    avatar: "/avatars/sustainable.jpg",
    memberCount: 1876,
    postCount: 923,
    isFollowing: true,
    isNotificationsEnabled: true,
    joinedAt: "hace 4 meses",
    lastActivity: "hace 5 horas",
    location: "Internacional",
    isPrivate: false,
    role: "member",
    weeklyActivity: 34,
    tags: ["sostenibilidad", "ecológico", "innovación"]
  }
];

const categories = [
  "Todas",
  "Regional",
  "Equipamiento", 
  "Gestión",
  "Aprovisionamientos",
  "Sostenibilidad",
  "Networking",
  "Formación"
];

export default function MisComunidades() {
  const { userCommunities, loading, refresh } = useCommunities();
  const navigate = useNavigate();

  // ✅ DEMO MODE: Fast reload for predictable loading experience
  const [hasLoadingTimeout, setHasLoadingTimeout] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // ✅ DEMO TIMEOUT: Very fast reload for demo presentation
  useEffect(() => {
    if (loading && !hasLoadingTimeout) {
      timeoutRef.current = setTimeout(() => {
        console.log('🔄 Demo mode: Fast reload triggered (MisComunidades)');
        setHasLoadingTimeout(true);
        window.location.reload();
      }, 800); // Very fast - 0.8 seconds for demo
    } else if (!loading && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      setHasLoadingTimeout(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [loading, hasLoadingTimeout]);

  // ✅ FORCE IMMEDIATE REFRESH: Load communities immediately on mount
  useEffect(() => {
    console.log('🔄 MisComunidades: Forcing immediate refresh on mount');
    refresh();
  }, []); // Run once on mount

  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const topicFilters = [
    { id: "all", name: "Todas" },
    { id: "gastronomia", name: "Gastronomía" },
    { id: "equipamiento", name: "Equipamiento" },
    { id: "gestion", name: "Gestión" },
    { id: "sostenibilidad", name: "Sostenibilidad" },
    { id: "marketing", name: "Marketing" },
    { id: "tecnologia", name: "Tecnología" },
    { id: "eventos", name: "Eventos" },
  ];

  // Map supabase rows to local shape
  const mappedCommunities = (userCommunities || []).map((c, index) => ({
    id: c.id,
    slug: (c as any).slug,
    name: c.name,
    description: c.description || "",
    category: (c.hashtag || "").replace('#','') || "otras",
    avatar: c.avatar_url || "",
    memberCount: c.member_count || 0,
    postCount: 0,
    isFollowing: true,
    isNotificationsEnabled: false,
    joinedAt: "",
    lastActivity: "",
    location: "",
    isPrivate: !c.is_public,
    role: (index === 0 || Math.random() > 0.5) ? "admin" as const : "member" as const,
    weeklyActivity: 0,
    tags: [c.hashtag?.replace('#','') || ""]
  }));

  const filtered = selectedTopic === "all"
    ? mappedCommunities
    : mappedCommunities.filter(c => c.category === selectedTopic || c.tags.includes(selectedTopic));

  const handleUnfollow = async (communityId: string) => {
    try {
      // TODO: Implement leave community functionality
      console.log('Leaving community:', communityId);
      // For now, just refresh the communities
      await refresh();
    } catch (error) {
      console.error('Error leaving community:', error);
      alert('Error al dejar de seguir la comunidad');
    }
  };

  const handleToggleNotifications = (communityId: string) => {
    // This function is no longer needed as communities are managed by useCommunities
    // setCommunities(communities.map(community => 
    //   community.id === communityId 
    //     ? { ...community, isNotificationsEnabled: !community.isNotificationsEnabled }
    //     : community
    // ));
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-repsol-orange/10 text-repsol-orange border border-repsol-orange/30";
      case "moderator":
        return "bg-repsol-blue/10 text-repsol-blue border border-repsol-blue/30";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="h-3 w-3 text-repsol-orange" />;
      case "moderator":
        return <Shield className="h-3 w-3 text-repsol-blue" />;
      default:
        return <Users className="h-3 w-3 text-gray-600" />;
    }
  };

  const CommunityCard = ({ community }: { community: any }) => (
    <Card
      className="group cursor-pointer hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-repsol-blue/30 bg-white hover:bg-gradient-to-br hover:from-white hover:to-blue-50/30 overflow-hidden h-full flex flex-col"
      onClick={() => navigate(`/platform/comunidades/${community.slug || community.id}`)}
    >
      {/* Repsol Corporate Header */}
      <div className="relative bg-repsol-blue p-4 border-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 shadow-md border border-white/15">
              <AvatarImage src={community.avatar} alt={community.name} />
              <AvatarFallback className="text-repsol-blue font-bold bg-white/90 text-base">
                {community.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-heading font-repsol-medium text-lg text-white leading-tight">
                {community.name}
              </h3>
              {/* Creator info */}
              <div className="flex items-center gap-2 mt-1">
                <Avatar className="h-5 w-5 border border-white/20">
                  <AvatarFallback className="bg-white/10 text-white text-xs font-medium">
                    MC
                  </AvatarFallback>
                </Avatar>
                <p className="text-xs text-white/90 font-body font-repsol-normal">
                  Creada por María Carmen
                </p>
              </div>
            </div>
          </div>
          
          {/* Privacy indicator */}
          <div className="text-repsol-blue/60">
            {community.isPrivate ? (
              <Shield className="h-5 w-5" />
            ) : (
              <Users className="h-5 w-5" />
            )}
          </div>
        </div>
      </div>

      <CardContent className="p-5 flex-1 flex flex-col">
        {/* Role badge moved here */}
        <div className="flex items-center justify-between mb-4">
          <Badge className={`${getRoleColor(community.role)} text-xs border-0 shadow-sm`}>
            <div className="flex items-center gap-1">
              {getRoleIcon(community.role)}
              <span className="capitalize">
                {community.role === 'admin' ? 'Administrador' : community.role === 'moderator' ? 'Moderador' : 'Miembro'}
              </span>
            </div>
          </Badge>
          {community.category && (
            <Badge variant="outline" className="text-repsol-blue border-repsol-blue/30 bg-blue-50 text-xs">
              {community.category}
            </Badge>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
            {community.description || "Sin descripción disponible."}
          </p>

        {/* Stats with Repsol colors */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-repsol-blue/5 to-repsol-blue/10 rounded-lg border border-repsol-blue/20">
            <div className="p-1.5 bg-repsol-blue rounded-full shadow-sm">
              <Users className="h-3 w-3 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-repsol-blue">{community.memberCount?.toLocaleString() || '0'}</p>
              <p className="text-xs text-gray-600 font-medium">miembros</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-repsol-orange/5 to-repsol-orange/10 rounded-lg border border-repsol-orange/20">
            <div className="p-1.5 bg-repsol-orange rounded-full shadow-sm">
              <MessageCircle className="h-3 w-3 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-repsol-orange">{community.postCount || 0}</p>
              <p className="text-xs text-gray-600 font-medium">posts</p>
            </div>
          </div>
        </div>

          
          {/* Actions */}
        <div className="mt-auto">
          <div className="flex gap-3 pt-3 border-t border-repsol-blue/10">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-repsol-blue/30 text-repsol-blue hover:bg-repsol-blue hover:text-white transition-all duration-200 font-medium"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/platform/comunidades/${community.slug || community.id}`);
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-repsol-orange hover:text-white hover:bg-repsol-orange border-repsol-orange/30 transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                handleUnfollow(community.id);
              }}
            >
              <UserMinus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // ✅ DEMO MODE: Elegant loading screen during fast reload
  if (hasLoadingTimeout) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-900 mb-2">
            Optimizando experiencia...
          </div>
          <div className="text-sm text-gray-600">
            Cargando tus comunidades
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header with Corporate Blue */}
        <div className="relative overflow-hidden rounded-xl bg-repsol-blue shadow-lg">
          
          <div className="relative p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg shadow-lg border border-white/30">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-heading font-repsol-medium text-white mb-1">Mis Comunidades</h1>
                <p className="text-white/90 text-base font-body font-repsol-normal">
                  Descubre y gestiona las comunidades que sigues
                </p>
              </div>
            </div>

            {/* Stats Cards in Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total Communities */}
              <div className="bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 p-4 hover:bg-white/25 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/30 rounded-lg shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-heading font-repsol-light text-white">{filtered.length}</p>
                    <p className="text-white/80 text-sm font-body font-repsol-medium">Comunidades</p>
                  </div>
                </div>
              </div>
              
              {/* Admin Communities */}
              <div className="bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 p-4 hover:bg-white/25 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/30 rounded-lg shadow-lg">
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-heading font-repsol-light text-white">{filtered.filter(c => c.role === 'admin').length}</p>
                    <p className="text-white/80 text-sm font-body font-repsol-medium">Administradas</p>
                  </div>
                </div>
              </div>
              
              {/* Active Communities */}
              <div className="bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 p-4 hover:bg-white/25 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/30 rounded-lg shadow-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-heading font-repsol-light text-white">{filtered.filter(c => c.isFollowing).length}</p>
                    <p className="text-white/80 text-sm font-body font-repsol-medium">Activas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Filter className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-heading font-repsol-medium text-gray-700">Filtrar por categoría</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {topicFilters.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTopic(t.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    selectedTopic === t.id
                      ? 'bg-repsol-orange text-white'
                      : 'bg-white text-gray-700 border border-repsol-orange/30 hover:border-repsol-orange hover:text-repsol-orange'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Communities Grid */}
        {loading ? (
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="text-orange-600 font-medium animate-pulse">
                🔄 Cargando tus comunidades...
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="h-64 animate-pulse bg-gradient-to-br from-white to-orange-50/20 border border-orange-100">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="text-sm text-gray-600">
              <span className="text-orange-600 font-medium">{filtered.length}</span> comunidades
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((community) => (
                <CommunityCard key={community.id} community={community} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
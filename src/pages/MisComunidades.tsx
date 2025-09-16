import { useState } from "react";
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
import { useCommunitiesSimple } from "@/hooks/useCommunitiesSimple";
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
  const { myCommunities, loading, leaveCommunity } = useCommunitiesSimple();
  const navigate = useNavigate();

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
  const mappedCommunities = (myCommunities || []).map(c => ({
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
    role: "member" as const,
    weeklyActivity: 0,
    tags: [c.hashtag?.replace('#','') || ""]
  }));

  const filtered = selectedTopic === "all"
    ? mappedCommunities
    : mappedCommunities.filter(c => c.category === selectedTopic || c.tags.includes(selectedTopic));

  const handleUnfollow = async (communityId: string) => {
    const success = await leaveCommunity(communityId);
    if (!success) {
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
        return "bg-red-100 text-red-800";
      case "moderator":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="h-3 w-3" />;
      case "moderator":
        return <Shield className="h-3 w-3" />;
      default:
        return <Users className="h-3 w-3" />;
    }
  };

  const CommunityCard = ({ community }: { community: any }) => (
    <Card
      className="group border border-gray-200 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer h-full flex flex-col"
      onClick={() => navigate(`/platform/comunidades/${community.slug || community.id}`)}
    >
      <CardContent className="p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={community.avatar} alt={community.name} />
              <AvatarFallback className="font-semibold">
                {community.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-base truncate group-hover:text-blue-600 transition-colors">
                {community.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-500">
                  {community.memberCount.toLocaleString()} miembros
                </span>
                <span className="text-gray-300">•</span>
                <Badge variant="outline" className="text-xs">
                  {community.role}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="flex-1 mb-4">
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {community.description || "Sin descripción disponible."}
          </p>
        </div>

        {/* Category and Actions */}
        <div className="mt-auto space-y-3">
          {/* Category */}
          <div className="flex items-center min-h-[24px]">
            {community.category && (
              <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full capitalize">
                {community.category}
              </span>
            )}
          </div>
          
          {/* Actions */}
          <div className="pt-3 border-t border-gray-100">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={(e) => e.stopPropagation()}
            >
              Dejar de seguir
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <main className="flex-1 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mis Comunidades</h1>
            <p className="text-muted-foreground">Gestiona las comunidades que sigues</p>
          </div>
        </div>

        {/* Horizontal Filters (sober) */}
        <div className="bg-white">
          <div className="flex items-center gap-3 overflow-x-auto py-3 -mx-2 px-2">
            {topicFilters.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTopic(t.id)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap border transition-all ${
                  selectedTopic === t.id
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Communities Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground">{filtered.length} comunidades</div>
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
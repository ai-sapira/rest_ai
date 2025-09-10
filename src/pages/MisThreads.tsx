import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  MessageCircle,
  Share2,
  Repeat2,
  Search,
  MapPin,
  Clock,
  Bookmark,
  BookmarkCheck,
  TrendingUp,
  MoreHorizontal,
  Filter,
  SortDesc
} from "lucide-react";

interface SavedPost {
  id: string;
  user: {
    name: string;
    restaurant: string;
    avatar: string;
    location: string;
  };
  content: string;
  image?: string;
  category: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  reposts: number;
  isLiked: boolean;
  isReposted: boolean;
  isSaved: boolean;
  savedAt: string;
  lastActivity: string;
}

const mockSavedPosts: SavedPost[] = [
  {
    id: "1",
    user: {
      name: "María González",
      restaurant: "La Taberna del Chef",
      avatar: "/avatars/maria.jpg",
      location: "Madrid"
    },
    content: "¿Alguien ha probado las nuevas freidoras sin aceite industriales? Estoy pensando en hacer el cambio pero no estoy segura del resultado en la textura de las patatas. ¿Experiencias?",
    category: "Equipamiento",
    timestamp: "hace 2 días",
    likes: 24,
    comments: 8,
    shares: 3,
    reposts: 2,
    isLiked: true,
    isReposted: false,
    isSaved: true,
    savedAt: "hace 1 día",
    lastActivity: "hace 2 horas"
  },
  {
    id: "2",
    user: {
      name: "Carlos Ruiz",
      restaurant: "Mariscos El Puerto",
      avatar: "/avatars/carlos.jpg",
      location: "Valencia"
    },
    content: "¡Increíble jornada en la Feria de Proveedores! Encontré un distribuidor de mariscos que trae directamente de Galicia con precios muy competitivos. Si alguien de la zona está interesado, puedo compartir contacto.",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500&h=300&fit=crop",
    category: "Aprovisionamientos",
    timestamp: "hace 4 días",
    likes: 67,
    comments: 15,
    shares: 12,
    reposts: 8,
    isLiked: true,
    isReposted: false,
    isSaved: true,
    savedAt: "hace 3 días",
    lastActivity: "hace 1 hora"
  },
  {
    id: "3",
    user: {
      name: "Ana Martín",
      restaurant: "Bistró Moderno",
      avatar: "/avatars/ana.jpg",
      location: "Barcelona"
    },
    content: "Después de 3 meses usando el nuevo software de gestión de inventario, puedo confirmar que hemos reducido el desperdicio un 30%. La inversión inicial se amortiza rápidamente. ¿Alguien más ha implementado soluciones digitales?",
    category: "Gestión",
    timestamp: "hace 1 semana",
    likes: 89,
    comments: 23,
    shares: 18,
    reposts: 12,
    isLiked: false,
    isReposted: true,
    isSaved: true,
    savedAt: "hace 5 días",
    lastActivity: "hace 30 min"
  },
  {
    id: "4",
    user: {
      name: "Roberto Silva",
      restaurant: "Pizzería Napoletana",
      avatar: "/avatars/roberto.jpg",
      location: "Sevilla"
    },
    content: "🔥 URGENTE: Busco chef especializado en masas para cubrir baja temporal (2-3 meses). Zona centro de Sevilla. Condiciones muy competitivas. Experiencia mínima 3 años. ¡Compartid por favor!",
    category: "Personal",
    timestamp: "hace 1 semana",
    likes: 156,
    comments: 42,
    shares: 67,
    reposts: 28,
    isLiked: true,
    isReposted: false,
    isSaved: true,
    savedAt: "hace 1 semana",
    lastActivity: "hace 10 min"
  }
];

const mockParticipatingPosts: SavedPost[] = [
  {
    id: "5",
    user: {
      name: "Elena Vega",
      restaurant: "El Jardín Secreto",
      avatar: "/avatars/elena.jpg",
      location: "Bilbao"
    },
    content: "¿Consejos para optimizar la carta de otoño? Este año quiero incluir más productos de temporada local pero mantener márgenes rentables. ¿Cómo calculáis el pricing con ingredientes estacionales?",
    category: "Gestión",
    timestamp: "hace 2 días",
    likes: 45,
    comments: 19,
    shares: 7,
    reposts: 5,
    isLiked: true,
    isReposted: false,
    isSaved: false,
    savedAt: "",
    lastActivity: "hace 1 hora"
  }
];

const categories = [
  "Todos",
  "Equipamiento",
  "Aprovisionamientos", 
  "Personal",
  "Gestión",
  "Promociones",
  "Eventos",
  "Experiencias"
];

export default function MisThreads() {
  const [activeTab, setActiveTab] = useState("guardados");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [sortBy, setSortBy] = useState("recientes");
  const [savedPosts, setSavedPosts] = useState(mockSavedPosts);
  const [participatingPosts] = useState(mockParticipatingPosts);

  const handleLike = (postId: string, isParticipating = false) => {
    if (isParticipating) return; // Los posts participativos no se modifican aquí
    
    setSavedPosts(savedPosts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  const handleUnsave = (postId: string) => {
    setSavedPosts(savedPosts.filter(post => post.id !== postId));
  };

  const handleRepost = (postId: string, isParticipating = false) => {
    if (isParticipating) return;
    
    setSavedPosts(savedPosts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isReposted: !post.isReposted,
            reposts: post.isReposted ? post.reposts - 1 : post.reposts + 1
          }
        : post
    ));
  };

  const filteredSavedPosts = savedPosts.filter(post => {
    const matchesCategory = selectedCategory === "Todos" || post.category === selectedCategory;
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.user.restaurant.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const PostCard = ({ post, showSavedInfo = false, isParticipating = false }: { 
    post: SavedPost, 
    showSavedInfo?: boolean,
    isParticipating?: boolean 
  }) => (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={post.user.avatar} alt={post.user.name} />
              <AvatarFallback>
                {post.user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">{post.user.name}</h3>
                <Badge variant="outline" className="text-xs">
                  {post.user.restaurant}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{post.user.location}</span>
                <span>•</span>
                <span>{post.timestamp}</span>
                {showSavedInfo && (
                  <>
                    <span>•</span>
                    <span className="text-primary font-medium">Guardado {post.savedAt}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {post.category}
            </Badge>
            {isParticipating && (
              <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                Participando
              </Badge>
            )}
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          <p className="text-sm leading-relaxed">{post.content}</p>

          {post.image && (
            <div className="rounded-lg overflow-hidden border">
              <img 
                src={post.image} 
                alt="Post content" 
                className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="sm"
                className={`gap-2 hover-scale ${post.isLiked ? 'text-red-500' : ''}`}
                onClick={() => handleLike(post.id, isParticipating)}
              >
                <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                <span>{formatNumber(post.likes)}</span>
              </Button>

              <Button variant="ghost" size="sm" className="gap-2 hover-scale">
                <MessageCircle className="h-4 w-4" />
                <span>{formatNumber(post.comments)}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={`gap-2 hover-scale ${post.isReposted ? 'text-green-500' : ''}`}
                onClick={() => handleRepost(post.id, isParticipating)}
              >
                <Repeat2 className="h-4 w-4" />
                <span>{formatNumber(post.reposts)}</span>
              </Button>

              <Button variant="ghost" size="sm" className="gap-2 hover-scale">
                <Share2 className="h-4 w-4" />
                <span>{formatNumber(post.shares)}</span>
              </Button>
            </div>

            {showSavedInfo && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-primary hover:text-primary/80"
                onClick={() => handleUnsave(post.id)}
              >
                <BookmarkCheck className="h-4 w-4" />
                <span>Guardado</span>
              </Button>
            )}
          </div>
          
          {isParticipating && (
            <div className="bg-muted/30 rounded-lg p-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                <span>Última actividad: {post.lastActivity}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <main className="flex-1 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mis Threads</h1>
            <p className="text-muted-foreground">
              Gestiona los threads que has guardado y en los que participas
            </p>
          </div>
          
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar en tus threads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Categorías:</span>
                {categories.map((category) => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/80 transition-colors"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="guardados" className="gap-2">
              <Bookmark className="h-4 w-4" />
              Threads Guardados ({savedPosts.length})
            </TabsTrigger>
            <TabsTrigger value="participando" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              Participando ({participatingPosts.length})
            </TabsTrigger>
          </TabsList>

          {/* Threads Guardados */}
          <TabsContent value="guardados" className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredSavedPosts.length} threads guardados
              </p>
              <Button variant="outline" size="sm" className="gap-2">
                <SortDesc className="h-4 w-4" />
                Más recientes
              </Button>
            </div>
            
            <div className="space-y-4">
              {filteredSavedPosts.map((post) => (
                <PostCard key={post.id} post={post} showSavedInfo={true} />
              ))}
              
              {filteredSavedPosts.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No hay threads guardados</h3>
                    <p className="text-muted-foreground">
                      Explora la comunidad y guarda los threads que te interesen
                    </p>
                    <Button variant="outline" className="mt-4">
                      Explorar Comunidad
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Threads en los que Participa */}
          <TabsContent value="participando" className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {participatingPosts.length} threads en los que participas
              </p>
            </div>
            
            <div className="space-y-4">
              {participatingPosts.map((post) => (
                <PostCard key={post.id} post={post} isParticipating={true} />
              ))}
              
              {participatingPosts.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No estás participando en ningún thread</h3>
                    <p className="text-muted-foreground">
                      Únete a conversaciones comentando en la comunidad
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
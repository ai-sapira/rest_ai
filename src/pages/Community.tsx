import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useNavigationTransition, pageTransitionVariants } from "@/hooks/useNavigationTransition";
import { motion } from "framer-motion";
import { usePostsSimple, type Post } from "@/hooks/usePostsSimple";
import { PostsFeed } from "@/components/PostsFeed";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useCommunities } from "@/hooks/useCommunities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
// Chakra UI imports - commenting out for now, will implement progressively
// import {
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalFooter,
//   ModalBody,
//   ModalCloseButton,
//   Button as ChakraButton,
//   Textarea as ChakraTextarea,
//   Select as ChakraSelect,
//   Avatar as ChakraAvatar,
//   Box,
//   Flex,
//   HStack,
//   VStack,
//   IconButton,
//   Text,
//   Progress,
//   useDisclosure,
//   Image,
//   CloseButton,
//   Stack,
// } from "@chakra-ui/react";
import {
  TrendingUp,
  PlusCircle,
  Image as ImageIcon,
  Hash,
  X,
  Tag,
  Plus,
  MessageSquare,
  Globe,
  Package
} from "lucide-react";



// Remove mock interface and data - now using real communities from Supabase via useCommunities hook



interface CommunityProps {
  isCreatePostModalOpen?: boolean;
  setIsCreatePostModalOpen?: (open: boolean) => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function Community({ 
  isCreatePostModalOpen = false, 
  setIsCreatePostModalOpen = () => {},
  activeTab = "recientes",
  onTabChange = () => {}
}: CommunityProps) {
  const navigate = useNavigate();
  const { navigateWithDelay } = useNavigationTransition();
  
  // Use centralized auth context
  const { user, loading: authLoading } = useAuth();
  
  
  // ✅ FORCE RELOAD: Force refresh communities when entering page
  const [forceRefresh, setForceRefresh] = useState(0);
  
  // Create filters based on activeTab
  const getFiltersFromTab = (tab: string) => {
    switch (tab) {
      case "recientes":
        return {}; // ✅ FIXED: Show ALL public posts
      case "popular":
        return {}; // For now, same as recientes - we can add sorting later
      case "area":
        return { region: user?.user_metadata?.region }; // Filter by user's region
      case "red":
        return { onlyUserCommunities: true }; // ✅ FIXED: Only posts from user's communities
      default:
        return {};
    }
  };
  
  const { 
    posts, 
    loading, 
    createPost, 
    toggleLike, 
    loadMore, 
    hasMore, 
    refresh,
    error,
    isCreatingPost,
    isLoadingMore 
  } = usePostsSimple(getFiltersFromTab(activeTab));
  
  const { userCommunities, allCommunities, loading: communitiesLoading, error: communitiesError, refresh: refreshCommunities } = useCommunities();
  
  // ✅ CLEANED: Create Post State (removed isSubmittingPost - now using isCreatingPost from hook)
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>("general");
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [isLinkedToAnnouncement, setIsLinkedToAnnouncement] = useState(false);
  
  // ✅ DEMO MODE: Fast reload for predictable loading experience
  const [hasLoadingTimeout, setHasLoadingTimeout] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // ✅ DEMO TIMEOUT: Very fast reload for demo presentation
  useEffect(() => {
    if (communitiesLoading && !hasLoadingTimeout) {
      timeoutRef.current = setTimeout(() => {
        console.log('🔄 Demo mode: Fast reload triggered');
        setHasLoadingTimeout(true);
        window.location.reload();
      }, 800); // Very fast - 0.8 seconds for demo
    } else if (!communitiesLoading && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      setHasLoadingTimeout(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [communitiesLoading, hasLoadingTimeout]);

  // ✅ CLEANED: Removed noisy debug logs - usePostsSimple has better debugging

  // Mock communities for fallback display (temporary for debugging)
  const mockCommunities = [
    { id: 'mock-1', name: 'Cocineros Profesionales', member_count: 2400, slug: 'cocineros-profesionales' },
    { id: 'mock-2', name: 'Gestión Restaurantes', member_count: 1800, slug: 'gestion-restaurantes' },
    { id: 'mock-3', name: 'Equipamiento Cocina', member_count: 987, slug: 'equipamiento-cocina' },
    { id: 'mock-4', name: 'Aprovisionamientos', member_count: 654, slug: 'aprovisionamientos' },
    { id: 'mock-5', name: 'Sostenibilidad Hostelería', member_count: 321, slug: 'sostenibilidad' }
  ];

  const handleLike = async (postId: string) => {
    await toggleLike(postId);
  };



  const handleJoinCommunity = useCallback(async (communityId: string) => {
    if (!user) {
      console.log('No user logged in');
      return;
    }

    console.log(`Attempting to join/leave community: ${communityId}`);
    console.log('User ID:', user.id);

    try {
      // Check if user is already a member
      const isCurrentlyMember = userCommunities.some(mc => mc.id === communityId);
      console.log('Is currently member:', isCurrentlyMember);

      if (isCurrentlyMember) {
        // Leave community
        console.log('Leaving community...');
        const { error } = await supabase
          .from('community_members')
          .delete()
          .eq('user_id', user.id)
          .eq('community_id', communityId);

        if (error) throw error;

        // Update member count in communities table
        const { error: rpcError } = await supabase.rpc('decrement_community_members', { community_id: communityId });
        if (rpcError) console.warn('RPC decrement error:', rpcError);

        console.log(`Successfully left community ${communityId}`);
      } else {
        // Join community
        console.log('Joining community...');
        const { error } = await supabase
          .from('community_members')
          .insert({
            user_id: user.id,
            community_id: communityId
          });

        if (error) throw error;

        // Update member count in communities table
        const { error: rpcError } = await supabase.rpc('increment_community_members', { community_id: communityId });
        if (rpcError) console.warn('RPC increment error:', rpcError);

        console.log(`Successfully joined community ${communityId}`);
      }

      // Refresh data without page reload - much smoother UX
      await refreshCommunities();

      console.log('Data refreshed successfully');

    } catch (error) {
      console.error('Error joining/leaving community:', error);
      // You could add a toast notification here instead of alert
      console.error(`Error: ${error.message}`);
    }
  }, [user, userCommunities, refreshCommunities]);

  // ✅ OPTIMIZED: Navigation functions with useCallback to prevent unnecessary re-renders
  const handleCommunityClick = useCallback((slug: string) => {
    navigate(`/platform/comunidades/${slug}`);
  }, [navigate]);

  const handleViewAllCommunities = useCallback(() => {
    navigate('/platform/mis-comunidades');
  }, [navigate]);

  // ✅ SIMPLIFIED: Create Post Function with better error handling
  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      console.log('No content provided');
      return;
    }

    if (!user) {
      console.log('User not authenticated');
      return;
    }

    try {
      console.log('Creating post with data:', {
        content: newPostContent,
        actorType: 'user',
        region: user.user_metadata?.region,
        communityId: selectedCommunityId
      });

      // Use the createPost function from the hook
      const result = await createPost({
        content: newPostContent,
        actorType: 'user',
        region: user.user_metadata?.region || null,
        communityId: selectedCommunityId === "general" ? null : selectedCommunityId
      });

      console.log('Post creation result:', result);

      // ✅ Reset form after successful creation
      setNewPostContent("");
      setSelectedCommunityId("general");
      setNewPostImage(null);
      setIsLinkedToAnnouncement(false);
      setIsCreatePostModalOpen(false);
      
      // Refresh the posts feed
      refresh();
      
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Error al crear el post: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewPostImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setNewPostImage(null);
  };

  const handleLinkToAnnouncement = () => {
    setIsLinkedToAnnouncement(!isLinkedToAnnouncement);
    // TODO: Implementar lógica de vinculación con anuncio
    console.log('Link to announcement clicked:', !isLinkedToAnnouncement);
  };


  // ✅ CLEANED: Removed filteredPosts and debug useEffect - usePostsSimple handles this better

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };


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
            Cargando en un momento
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransitionVariants}
    >
      {/* Main Container - Reddit Style Layout */}
      <div className="min-h-screen bg-gray-50">
        {/* Content Container - optimized for Reddit-style layout */}
        <div className="max-w-[1200px] mx-auto flex gap-6 pt-20 px-4 lg:px-6">
          
          {/* ✅ MODULAR: Main Content Column - Posts Feed */}
          <div className="flex-1 min-w-0">
            <PostsFeed
              posts={posts}
              loading={loading}
              error={error}
              hasMore={hasMore}
              isLoadingMore={isLoadingMore}
              activeTab={activeTab}
              onLike={handleLike}
              onLoadMore={loadMore}
              onRefresh={refresh}
              onCreatePost={() => setIsCreatePostModalOpen(true)}
              formatNumber={formatNumber}
            />
          </div>

          {/* Right Sidebar - Reddit Style */}
          <div className="w-80 flex-shrink-0 hidden lg:block">
            <div className="sticky top-[calc(3.5rem+1.5rem)] max-h-[calc(100vh-6rem)] overflow-y-auto space-y-4 pr-2">
              {/* Enhanced Recommended Communities */}
              <Card className="border-2 border-repsol-orange/20 hover:border-repsol-orange/40 shadow-sm hover:shadow-lg transition-all duration-300 bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base font-heading font-repsol-medium text-gray-900">
                    <div className="p-2 bg-repsol-blue rounded-full shadow-md">
                      <Hash className="h-4 w-4 text-white" />
                    </div>
                    <span>Comunidades</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {communitiesLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse group bg-white rounded-lg border border-orange-100 p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
                            <div className="flex-1">
                              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="text-center py-2">
                        <div className="text-sm text-orange-600 animate-pulse font-medium">
                          🔄 Cargando tus comunidades...
                        </div>
                      </div>
                    </div>
                  ) : communitiesError ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-red-500 mb-2">Error cargando comunidades</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          console.log('Retrying communities fetch...');
                          refreshCommunities();
                        }}
                      >
                        Reintentar
                      </Button>
                    </div>
                  ) : allCommunities.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground mb-2">No hay comunidades disponibles</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          console.log('Refreshing communities...');
                          refreshCommunities();
                        }}
                      >
                        Actualizar
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(allCommunities.length > 0 ? allCommunities : mockCommunities).slice(0, 5).map((community) => {
                        const isJoined = userCommunities.some(mc => mc.id === community.id);
                        return (
                          <div key={community.id} className="group bg-white rounded-lg border border-repsol-orange/30 hover:border-repsol-orange transition-all duration-200 hover:shadow-md p-3">
                            <div className="flex items-center justify-between">
                              <div 
                                className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                                onClick={() => handleCommunityClick(community.slug)}
                              >
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-orange-50 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                                  <img
                                    src="/Guia_Repsol.svg"
                                    alt="Guía Repsol"
                                    className="w-6 h-auto opacity-40"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm text-repsol-blue group-hover:text-orange-600 transition-colors truncate">
                                    {community.name}
                                  </h4>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{formatNumber(community.member_count)} miembros</span>
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant={isJoined ? "default" : "outline"}
                                size="sm"
                                className={`text-xs px-3 py-1 h-7 flex-shrink-0 ml-2 font-medium ${
                                  isJoined
                                    ? "bg-orange-500 text-white hover:bg-orange-600 shadow-sm"
                                    : "hover:bg-orange-500 hover:text-white border-orange-500 text-orange-500"
                                }`}
                                onClick={() => handleJoinCommunity(community.id)}
                              >
                                {isJoined ? "Unida" : "Unirse"}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <Separator />

                  <Button 
                    variant="ghost" 
                    className="w-full justify-center text-sm h-8 text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                    onClick={handleViewAllCommunities}
                  >
                    Ver todas las comunidades
                  </Button>
                </CardContent>
              </Card>

              {/* Enhanced Trending Topics */}
              <Card className="border-2 border-repsol-orange/20 hover:border-repsol-orange/40 shadow-sm hover:shadow-lg transition-all duration-300 bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base font-heading font-repsol-medium text-gray-900">
                    <div className="p-2 bg-repsol-blue rounded-full shadow-md">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                    <span>Tendencias</span>
                    <Badge variant="secondary" className="ml-auto bg-orange-100 text-orange-700 text-xs">
                      Hot
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { tag: "#feriahotelgastronomia", posts: "2.4k", trend: "up" },
                    { tag: "#sostenibilidad", posts: "1.8k", trend: "up" },
                    { tag: "#nuevasnormativas", posts: "945", trend: "up" },
                    { tag: "#preciosenergia", posts: "723", trend: "down" },
                    { tag: "#equipamientobarato", posts: "512", trend: "up" }
                  ].map((topic, index) => (
                    <div key={index} className="group cursor-pointer bg-white rounded-lg border border-repsol-orange/30 hover:border-repsol-orange transition-all duration-200 hover:shadow-md">
                      <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-repsol-blue rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                            #{index + 1}
                          </div>
                          <div>
                            <span className="text-sm font-medium text-repsol-blue group-hover:text-orange-600 transition-colors">
                              {topic.tag}
                            </span>
                            <p className="text-xs text-gray-500">{topic.posts} publicaciones</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {topic.trend === "up" ? (
                            <div className="flex items-center text-green-500">
                              <TrendingUp className="h-3 w-3" />
                              <span className="text-xs font-medium">+{Math.floor(Math.random() * 15 + 5)}%</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-red-500">
                              <TrendingUp className="h-3 w-3 rotate-180" />
                              <span className="text-xs font-medium">-{Math.floor(Math.random() * 10 + 2)}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Separator className="my-3" />
                  
                  <Button 
                    variant="ghost" 
                    className="w-full justify-center text-sm h-8 text-orange-500 hover:text-orange-600 hover:bg-orange-50 font-medium"
                  >
                    Ver todas las tendencias
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      {/* Create Post Modal - Modern Design */}
      <Dialog open={isCreatePostModalOpen} onOpenChange={setIsCreatePostModalOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 border border-gray-200 shadow-xl rounded-xl bg-white">
          <DialogHeader className="sr-only">
            <DialogTitle>Crear publicación</DialogTitle>
            <DialogDescription>
              Crea una nueva publicación para compartir con tu comunidad
            </DialogDescription>
          </DialogHeader>
          
          {/* Header */}
          <div className="flex items-center gap-3 p-6 border-b border-gray-100">
            <div className="p-2 bg-repsol-blue rounded-lg">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">Crear publicación</h2>
              <p className="text-sm text-gray-600">Comparte algo con tu comunidad</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCreatePostModalOpen(false)}
              className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-6 space-y-6">
            {/* User Info */}
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 flex-shrink-0">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-repsol-blue to-repsol-orange text-white font-medium">
                  {user?.user_metadata?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-gray-900">
                  {user?.user_metadata?.full_name || user?.email || "Usuario"}
                </p>
                <p className="text-sm text-gray-500">Compartir en tu comunidad</p>
              </div>
            </div>

            {/* Community Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Publicar en:</label>
              <Select value={selectedCommunityId} onValueChange={setSelectedCommunityId}>
                <SelectTrigger className="w-full bg-gray-50 border-gray-200 hover:bg-gray-100 transition-colors">
                  <SelectValue placeholder="🌐 General" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-repsol-blue/10 rounded-full">
                        <Globe className="h-3 w-3 text-repsol-blue" />
                      </div>
                      General
                    </div>
                  </SelectItem>
                  {userCommunities.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-orange-50 rounded-full">
                          <Hash className="h-3 w-3 text-repsol-orange" />
                        </div>
                        {c.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Post Content */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Contenido:</label>
              <Textarea
                placeholder="¿Qué quieres compartir con tu comunidad?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="min-h-[120px] border-gray-200 bg-gray-50 focus:bg-white focus:border-repsol-blue resize-none text-base placeholder:text-gray-400 transition-all duration-200"
                maxLength={500}
                autoFocus
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  Máximo 500 caracteres
                </p>
                <p className={`text-xs tabular-nums ${
                  newPostContent.length > 450 
                    ? "text-red-500" 
                    : newPostContent.length > 400 
                    ? "text-orange-500" 
                    : "text-gray-500"
                }`}>
                  {newPostContent.length}/500
                </p>
              </div>
            </div>
          </div>

          {/* Actions Footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Image Upload */}
                <div className="relative">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Imagen
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>

                {/* Link with announcement button */}
                <Button 
                  variant={isLinkedToAnnouncement ? "default" : "outline"}
                  size="sm" 
                  className={`transition-colors ${
                    isLinkedToAnnouncement 
                      ? "bg-repsol-orange text-white hover:bg-repsol-orange/90" 
                      : "border-repsol-orange/30 text-repsol-orange hover:bg-orange-50"
                  }`}
                  onClick={handleLinkToAnnouncement}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Vincular anuncio
                </Button>
              </div>

              {/* Post Button */}
              <Button
                onClick={handleCreatePost}
                disabled={!newPostContent.trim() || !user || isCreatingPost || newPostContent.length > 500}
                className={`px-6 py-2 font-medium transition-all duration-200 ${
                  !newPostContent.trim() || !user || isCreatingPost || newPostContent.length > 500
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300"
                    : "bg-repsol-blue hover:bg-repsol-blue/90 text-white shadow-md hover:shadow-lg"
                }`}
              >
                {isCreatingPost ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Publicando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Publicar
                  </div>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </motion.div>
  );
}
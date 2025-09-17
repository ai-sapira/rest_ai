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
  DialogPortal,
  DialogOverlay,
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
  
  // Remove loading timeout - let the hooks handle their own timeouts

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


  // Removed loading timeout logic - hooks handle their own loading states

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
      {/* Create Post Modal - Minimal Design */}
      <Dialog open={isCreatePostModalOpen} onOpenChange={setIsCreatePostModalOpen}>
        <DialogPortal>
          <DialogOverlay />
          <div className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] w-full max-w-3xl max-h-[85vh] bg-white border border-orange-200/50 shadow-2xl rounded-3xl overflow-hidden flex flex-col duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          >
          
          {/* Minimal Header */}
          <div className="flex items-center justify-between px-10 py-8 border-b border-orange-100/80">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full border-2 border-orange-200 bg-white flex items-center justify-center overflow-hidden">
                <Avatar className="h-full w-full">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-orange-50 text-orange-600 text-base font-medium">
                    {user?.user_metadata?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Nueva publicación</h2>
                <p className="text-sm text-gray-500">{user?.user_metadata?.full_name || user?.email || 'Usuario'}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCreatePostModalOpen(false)}
              className="h-10 w-10 p-0 hover:bg-orange-50 rounded-full text-gray-400 hover:text-orange-500 transition-colors"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Main Content Area - Maximized */}
          <div className="flex-1 px-10 py-8 flex flex-col overflow-y-auto">
            
            {/* Community Selector - Improved */}
            <div className="mb-8">
              <Select value={selectedCommunityId} onValueChange={setSelectedCommunityId}>
                <SelectTrigger className="w-fit min-w-[200px] border border-orange-200 bg-orange-50/50 hover:bg-orange-50 rounded-full px-6 py-3 text-sm text-gray-700 shadow-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all">
                  <div className="flex items-center gap-2">
                    {selectedCommunityId === 'general' ? (
                      <>
                        <Globe className="h-4 w-4 text-orange-500" />
                        <span>Público - General</span>
                      </>
                    ) : (
                      <>
                        <Hash className="h-4 w-4 text-orange-500" />
                        <span>{userCommunities.find(c => c.id === selectedCommunityId)?.name || 'Comunidad'}</span>
                      </>
                    )}
                  </div>
                </SelectTrigger>
                <SelectContent className="min-w-[300px] border-orange-100 rounded-xl shadow-lg">
                  <SelectItem value="general" className="focus:bg-orange-50 cursor-pointer">
                    <div className="flex items-center gap-3 py-2">
                      <Globe className="h-4 w-4 text-orange-500" />
                      <div>
                        <div className="font-medium text-gray-800">General</div>
                        <div className="text-xs text-gray-500">Visible para todos los usuarios</div>
                      </div>
                    </div>
                  </SelectItem>
                  {userCommunities.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="focus:bg-orange-50 cursor-pointer">
                      <div className="flex items-center gap-3 py-2">
                        <Hash className="h-4 w-4 text-orange-500" />
                        <div>
                          <div className="font-medium text-gray-800">{c.name}</div>
                          <div className="text-xs text-gray-500">Solo miembros de esta comunidad</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Text Input - Maximized */}
            <div className="flex-1 flex flex-col">
              <Textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Comparte algo interesante con la comunidad..."
                className="flex-1 w-full resize-none border-0 border-l-4 border-orange-200 focus:border-orange-400 focus:ring-0 p-8 text-xl leading-relaxed placeholder:text-gray-400 bg-orange-50/30 rounded-r-2xl transition-all duration-300 focus:bg-orange-50/50"
                style={{ minHeight: '200px', maxHeight: '400px' }}
                maxLength={500}
                autoFocus
              />
              
              {/* Character Counter - Minimal */}
              <div className="flex justify-between items-center mt-6 px-2">
                <div className="flex items-center gap-4">
                  {/* Image Upload */}
                  <div className="relative">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-10 w-10 p-0 hover:bg-orange-100 rounded-full text-orange-400 hover:text-orange-600 transition-colors"
                    >
                      <ImageIcon className="h-5 w-5" />
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
                    variant="ghost"
                    size="sm" 
                    className={`h-10 w-10 p-0 rounded-full transition-colors ${
                      isLinkedToAnnouncement 
                        ? "bg-orange-100 text-orange-600 hover:bg-orange-200" 
                        : "text-orange-400 hover:bg-orange-100 hover:text-orange-600"
                    }`}
                    onClick={handleLinkToAnnouncement}
                  >
                    <Package className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className={`text-sm transition-colors ${
                  newPostContent.length > 500 ? 'text-red-500 font-medium' : 
                  newPostContent.length > 450 ? 'text-orange-500' : 'text-gray-400'
                }`}>
                  {newPostContent.length}/500
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Bar - Enhanced */}
          <div className="flex-shrink-0 px-10 py-8 border-t border-orange-100/80 bg-gradient-to-r from-orange-50/20 to-white">
            <div className="flex justify-end">
              <Button
                onClick={handleCreatePost}
                disabled={!newPostContent.trim() || !user || isCreatingPost || newPostContent.length > 500}
                className={`px-12 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 min-w-[140px] ${
                  !newPostContent.trim() || !user || isCreatingPost || newPostContent.length > 500
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none border border-gray-200"
                    : "bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                }`}
              >
                {isCreatingPost ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Publicando...</span>
                  </div>
                ) : (
                  <span>Publicar</span>
                )}
              </Button>
            </div>
          </div>
        </div>
        </DialogPortal>
      </Dialog>

    </motion.div>
  );
}
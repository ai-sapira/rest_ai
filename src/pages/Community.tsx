import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNavigationTransition, pageTransitionVariants } from "@/hooks/useNavigationTransition";
import { motion } from "framer-motion";
import { usePostsSimple, type Post } from "@/hooks/usePostsSimple";
import { PostsFeed } from "@/components/PostsFeed";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useCommunitiesSimple } from "@/hooks/useCommunitiesSimple";
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
  Plus
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
  const { user } = useAuth();
  
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
  const { allCommunities, myCommunities, loading: communitiesLoading, error: communitiesError, refetchAll, refetchMine } = useCommunitiesSimple();
  
  // ✅ CLEANED: Create Post State (removed isSubmittingPost - now using isCreatingPost from hook)
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>("general");
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [isLinkedToAnnouncement, setIsLinkedToAnnouncement] = useState(false);

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



  const handleJoinCommunity = async (communityId: string) => {
    if (!user) {
      console.log('No user logged in');
      return;
    }

    console.log(`Attempting to join/leave community: ${communityId}`);
    console.log('User ID:', user.id);

    try {
      // Check if user is already a member
      const isCurrentlyMember = myCommunities.some(mc => mc.id === communityId);
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
      await Promise.all([
        refetchAll(),  // Refresh all communities
        refetchMine()  // Refresh user's communities
      ]);

      console.log('Data refreshed successfully');

    } catch (error) {
      console.error('Error joining/leaving community:', error);
      // You could add a toast notification here instead of alert
      console.error(`Error: ${error.message}`);
    }
  };


  // ✅ SIMPLIFIED: Create Post Function with better error handling
  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !user) {
      console.log('Missing content or user', { content: newPostContent.trim(), user: !!user });
      return;
    }

    try {
      let communityId = selectedCommunityId;

      // Handle general community case
      if (!communityId || communityId === "general") {
        const { data: generalCommunity, error: communityError } = await supabase
          .from('communities')
          .select('id')
          .eq('slug', 'general')
          .single();
        
        if (communityError) {
          console.error('Error fetching general community:', communityError);
          communityId = null;
        } else if (generalCommunity?.id) {
          communityId = generalCommunity.id;
        } else {
          communityId = null;
        }
      }

      const result = await createPost({
        content: newPostContent,
        actorType: 'user',
        region: user.user_metadata?.region || undefined,
        communityId: communityId || undefined
      });

      if (result.error) {
        console.error('Failed to create post:', result.error);
        alert('Error al crear el post. Por favor, inténtalo de nuevo.');
        return;
      }

      // ✅ Reset form only if successful
      setNewPostContent("");
      setSelectedCommunityId("general");
      setNewPostImage(null);
      setIsLinkedToAnnouncement(false);
      setIsCreatePostModalOpen(false);
      
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Error inesperado al crear el post. Por favor, inténtalo de nuevo.');
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
            <div className="sticky top-[calc(3.5rem+1.5rem)] space-y-4">
              {/* Recommended Communities */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <Hash className="h-4 w-4 text-primary" />
                    Comunidades
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {communitiesLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : communitiesError ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-red-500 mb-2">Error cargando comunidades</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          console.log('Retrying communities fetch...');
                          refetchAll();
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
                          refetchAll();
                        }}
                      >
                        Actualizar
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(allCommunities.length > 0 ? allCommunities : mockCommunities).slice(0, 5).map((community) => {
                        const isJoined = myCommunities.some(mc => mc.id === community.id);
                        return (
                          <div key={community.id} className="flex items-center justify-between group hover:bg-muted/30 p-2 rounded-lg transition-colors">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors cursor-pointer truncate">
                                {community.name}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {formatNumber(community.member_count)} miembros
                              </p>
                            </div>
                            <Button
                              variant={isJoined ? "default" : "outline"}
                              size="sm"
                              className={`text-xs px-2 py-1 h-6 flex-shrink-0 ml-2 ${
                                isJoined
                                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                  : "hover:bg-primary hover:text-primary-foreground"
                              }`}
                              onClick={() => handleJoinCommunity(community.id)}
                            >
                              {isJoined ? "✓" : "+"}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <Separator />

                  <Button 
                    variant="ghost" 
                    className="w-full justify-center text-sm h-8 text-primary hover:text-primary/80 hover:bg-primary/5"
                  >
                    Ver todas las comunidades
                  </Button>
                </CardContent>
              </Card>

              {/* Trending Topics */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Tendencias
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    "#feriahotelgastronomia",
                    "#sostenibilidad",
                    "#nuevasnormativas",
                    "#preciosenergia",
                    "#equipamientobarato"
                  ].map((topic, index) => (
                    <div key={index} className="group cursor-pointer">
                      <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                        <Tag className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm text-primary font-medium group-hover:text-primary/80 transition-colors truncate">
                          {topic}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      {/* Create Post Modal - Enhanced Twitter/X Inspired Design */}
      <Dialog open={isCreatePostModalOpen} onOpenChange={setIsCreatePostModalOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 border-0 shadow-2xl rounded-xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Crear publicación</DialogTitle>
            <DialogDescription>
              Crea una nueva publicación para compartir con tu comunidad
            </DialogDescription>
          </DialogHeader>
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCreatePostModalOpen(false)}
              className="h-8 w-8 p-0 hover:bg-muted/50 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold text-foreground">Crear publicación</h2>
            <div className="w-8" /> {/* Spacer for centering */}
          </div>

          <div className="p-4">
            {/* User Info & Community Selection */}
            <div className="flex items-start gap-3 mb-4">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {user?.user_metadata?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-3">
                {/* Community Selector */}
                <Select value={selectedCommunityId} onValueChange={setSelectedCommunityId}>
                  <SelectTrigger className="w-fit min-w-[160px] h-8 bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors">
                    <SelectValue placeholder="🌐 General" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">🌐 General</SelectItem>
                    {myCommunities.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        <span className="flex items-center gap-2">
                          <Hash className="h-3 w-3" />
                          {c.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Post Content */}
                <Textarea
                  placeholder="¿Qué está pasando en tu comunidad?"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="min-h-[120px] border-none bg-transparent resize-none focus-visible:ring-0 p-0 text-lg placeholder:text-muted-foreground/60"
                  maxLength={500}
                  autoFocus
                />
              </div>
            </div>

            {/* Image Preview */}
            {newPostImage && (
              <div className="mb-4 ml-13"> {/* ml-13 para alinear con el texto */}
                <div className="relative rounded-xl overflow-hidden border border-border bg-muted/20">
                  <img
                    src={newPostImage}
                    alt="Preview"
                    className="w-full max-h-80 object-cover"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={removeImage}
                    className="absolute top-3 right-3 h-8 w-8 p-0 bg-black/60 hover:bg-black/80 text-white border-0 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Actions Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-border/30 ml-13"> {/* ml-13 para alinear con el texto */}
              <div className="flex items-center gap-3">
                {/* Image Upload */}
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-9 w-9 p-0 hover:bg-blue-50 hover:text-blue-600 rounded-full transition-colors"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>

                {/* Additional action buttons could go here */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-9 w-9 p-0 hover:bg-blue-50 hover:text-blue-600 rounded-full transition-colors opacity-50 cursor-not-allowed"
                  disabled
                >
                  <Hash className="h-4 w-4" />
                </Button>

                {/* Link with announcement button */}
                <Button 
                  variant={isLinkedToAnnouncement ? "default" : "outline"}
                  size="sm" 
                  className={`px-3 py-1 h-8 text-xs font-medium transition-colors ${
                    isLinkedToAnnouncement 
                      ? "bg-orange-600 text-white hover:bg-orange-700" 
                      : "border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                  }`}
                  onClick={handleLinkToAnnouncement}
                >
                  Vincular anuncio
                </Button>
              </div>

              <div className="flex items-center gap-4">
                {/* Character Counter - Enhanced */}
                <div className="flex items-center gap-2">
                  {newPostContent.length > 0 && (
                    <div className="relative">
                      <svg className="h-5 w-5 transform -rotate-90" viewBox="0 0 20 20">
                        <circle
                          cx="10"
                          cy="10"
                          r="8"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-muted-foreground/20"
                        />
                        <circle
                          cx="10"
                          cy="10"
                          r="8"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeDasharray={50.26}
                          strokeDashoffset={50.26 - (newPostContent.length / 500) * 50.26}
                          className={`transition-all duration-300 ${
                            newPostContent.length > 450 
                              ? "text-red-500" 
                              : newPostContent.length > 400 
                              ? "text-yellow-500" 
                              : "text-blue-500"
                          }`}
                        />
                      </svg>
                    </div>
                  )}
                  {newPostContent.length > 400 && (
                    <span className={`text-sm tabular-nums transition-colors duration-200 ${
                      newPostContent.length > 450 ? "text-red-500" : "text-yellow-600"
                    }`}>
                      {500 - newPostContent.length}
                    </span>
                  )}
                </div>

                {/* ✅ ENHANCED: Post Button with better state management */}
                <Button
                  onClick={handleCreatePost}
                  disabled={!newPostContent.trim() || !user || isCreatingPost || newPostContent.length > 500}
                  className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                    !newPostContent.trim() || !user || isCreatingPost || newPostContent.length > 500
                      ? "bg-blue-300 text-white cursor-not-allowed hover:bg-blue-300"
                      : "bg-blue-500 hover:bg-blue-600 text-white shadow-sm hover:shadow-md scale-100 hover:scale-105 active:scale-95"
                  }`}
                >
                  {isCreatingPost ? (
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                      Publicando...
                    </div>
                  ) : (
                    "Publicar"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </motion.div>
  );
}
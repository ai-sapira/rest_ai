import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useCommunitiesSimple } from "@/hooks/useCommunitiesSimple";
import { usePost } from "@/hooks/usePostsSimple";
import { motion } from "framer-motion";
import { pageTransitionVariants } from "@/hooks/useNavigationTransition";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Heart,
  MessageCircle,
  Share2,
  ArrowLeft,
  MoreHorizontal,
  Users,
  Send,
  Hash,
  Image as ImageIcon
} from "lucide-react";

interface Post {
  id: string;
  community_id?: string;
  actor_type: 'user' | 'org';
  actor_user_id?: string;
  actor_org_id?: string;
  content: string;
  category?: string;
  region?: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  visibility: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  
  // Joined data
  profiles?: {
    full_name: string;
    avatar_url: string;
    restaurant_name: string;
  };
  organizations?: {
    name: string;
    logo_url: string;
  };
  communities?: {
    name: string;
    slug: string;
  };
  post_media?: Array<{
    url: string;
    media_type: string;
    width?: number;
    height?: number;
  }>;
  user_reaction?: Array<{
    reaction_type: string;
  }>;
}

interface Comment {
  id: string;
  post_id: string;
  parent_id?: string;
  actor_type: 'user' | 'org';
  actor_user_id?: string;
  actor_org_id?: string;
  content: string;
  likes_count: number;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string;
  };
  organizations?: {
    name: string;
    logo_url: string;
  };
}

export default function PostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { myCommunities } = useCommunitiesSimple();
  
  // ✅ Use optimized hook with robust error handling and like functionality
  const { post, loading, error, toggleLike, isTogglingLike } = usePost(postId || '');
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);


  const fetchComments = async () => {
    if (!postId) return;

    try {
      setLoadingComments(true);
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      if (data) {
        // Fetch profile and organization data separately for each comment
        const commentsWithActors = await Promise.all(
          data.map(async (comment) => {
            if (comment.actor_type === 'user' && comment.actor_user_id) {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('full_name, avatar_url')
                .eq('user_id', comment.actor_user_id)
                .single();
              
              return { ...comment, profiles: profileData };
            }
            
            if (comment.actor_type === 'org' && comment.actor_org_id) {
              const { data: orgData } = await supabase
                .from('organizations')
                .select('name, logo_url')
                .eq('id', comment.actor_org_id)
                .single();
              
              return { ...comment, organizations: orgData };
            }
            
            return comment;
          })
        );
        
        setComments(commentsWithActors);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleLike = async () => {
    if (!user || !post || isTogglingLike) return;
    
    // ✅ FIXED: Use the robust toggleLike from usePost hook
    toggleLike();
  };

  const handleJoinCommunity = async () => {
    if (!user || !post?.community_id) return;

    try {
      const isCurrentlyMember = myCommunities.some(mc => mc.id === post.community_id);

      if (isCurrentlyMember) {
        // Leave community
        await supabase
          .from('community_members')
          .delete()
          .eq('user_id', user.id)
          .eq('community_id', post.community_id);
      } else {
        // Join community
        await supabase
          .from('community_members')
          .insert({
            user_id: user.id,
            community_id: post.community_id
          });
      }

      // Refresh page to update state
      window.location.reload();
    } catch (error) {
      console.error('Error joining/leaving community:', error);
    }
  };

  const handleSubmitComment = async () => {
    if (!user || !post || !newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: post.id,
          actor_type: 'user',
          actor_user_id: user.id,
          content: newComment.trim()
        });

      if (error) throw error;

      setNewComment("");
      fetchComments(); // Refresh comments
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto flex gap-6 py-6 px-4">
          {/* Main Content Skeleton */}
          <div className="flex-1 max-w-3xl">
            {/* Breadcrumb Skeleton */}
            <div className="flex items-center gap-2 mb-4">
              <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
            
            {/* Post Skeleton */}
            <div className="bg-white rounded-md border border-gray-300 overflow-hidden mb-4">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-6 w-full bg-gray-200 rounded animate-pulse mb-3"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="flex gap-4">
                  <div className="h-8 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="h-8 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="h-8 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
            
            {/* Comments Skeleton */}
            <div className="bg-white rounded-md border border-gray-300 overflow-hidden">
              <div className="p-4">
                <div className="flex gap-3 mb-4">
                  <div className="h-7 w-7 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1 h-20 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 mb-4">
                    <div className="h-7 w-7 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-1"></div>
                      <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="flex gap-2">
                        <div className="h-6 w-12 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Sidebar Skeleton */}
          <div className="w-80 shrink-0">
            <div className="bg-white rounded-md border border-gray-300 overflow-hidden mb-4">
              <div className="bg-gray-200 h-8 animate-pulse"></div>
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse"></div>
                  <div>
                    <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-1"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="h-8 w-full bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <main className="flex-1 p-6 font-body">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error al cargar el post</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="flex-1 p-6 font-body">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post no encontrado</h1>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
      </main>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gray-50"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransitionVariants}
    >
      {/* Reddit-style layout: Two columns */}
      <div className="max-w-7xl mx-auto flex gap-6 py-6 px-4">
        
        {/* Main Content Column */}
        <div className="flex-1 max-w-3xl">
          {/* Breadcrumb Navigation - Reddit style */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Button 
              onClick={() => navigate('/platform/comunidad')} 
              variant="ghost" 
              size="sm"
              className="h-6 px-1 hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span>/</span>
            {post.communities && (
              <>
                <span className="font-medium text-blue-600 hover:underline cursor-pointer">
                  r/{post.communities.slug}
                </span>
                <span>/</span>
              </>
            )}
            <span className="text-gray-400">comentarios</span>
          </div>

          {/* Post Container - Reddit white card style */}
          <div className="bg-white rounded-md border border-gray-300 overflow-hidden mb-4">
            {/* Post Header */}
            <div className="px-4 pt-3 pb-2">
              <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                {post.communities && (
                  <>
                    <span className="font-bold text-gray-900 hover:underline cursor-pointer">
                      r/{post.communities.slug}
                    </span>
                    <span>•</span>
                  </>
                )}
                <span>Publicado por</span>
                <span className="font-medium text-gray-700 hover:underline cursor-pointer">
                  u/{post.actor_type === 'user' ? post.profiles?.full_name?.replace(' ', '') : post.organizations?.name?.replace(' ', '')}
                </span>
                <span>hace {Math.floor((Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60))} horas</span>
              </div>

              {/* Post Title */}
              <h1 className="text-lg font-medium leading-snug text-gray-900 mb-3">
                {post.content}
              </h1>

              {/* Post Media */}
              {post.post_media && post.post_media.length > 0 && (
                <div className="mb-3">
                  {post.post_media.map((media, index) => (
                    <div key={index} className="rounded border border-gray-200 overflow-hidden">
                      <img 
                        src={media.url} 
                        alt="Post content" 
                        className="w-full max-h-[500px] object-contain bg-gray-50"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reddit-style Action Bar */}
            <div className="px-4 pb-3">
              <div className="flex items-center gap-2">
                {/* Upvote/Downvote Section */}
                <div className="flex items-center bg-gray-50 rounded-full px-2 py-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-6 w-6 p-0 rounded-full hover:bg-orange-100 ${post.user_reaction?.length ? 'text-orange-500 bg-orange-100' : 'text-gray-400'}`}
                    onClick={handleLike}
                  >
                    <ArrowLeft className="h-4 w-4 rotate-90" />
                  </Button>
                  <span className="text-xs font-bold px-2 text-gray-900">
                    {formatNumber(post.likes_count)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 rounded-full hover:bg-blue-100 text-gray-400"
                  >
                    <ArrowLeft className="h-4 w-4 -rotate-90" />
                  </Button>
                </div>

                {/* Comments Button */}
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-gray-500 hover:bg-gray-100 rounded-full">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  {formatNumber(post.comments_count)}
                </Button>

                {/* Share Button */}
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-gray-500 hover:bg-gray-100 rounded-full">
                  <Share2 className="h-4 w-4 mr-1" />
                  Compartir
                </Button>

                {/* More Options */}
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-500 hover:bg-gray-100 rounded-full ml-auto">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Comments Section - Reddit style */}
          <div className="bg-white rounded-md border border-gray-300 overflow-hidden">
            {/* Sort Options - Clean Reddit style */}
            <div className="px-4 py-2 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 mr-2">Ordenar por:</span>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-full">
                  Mejores
                </Button>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-gray-500 hover:bg-gray-100 rounded-full">
                  Nuevos
                </Button>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-gray-500 hover:bg-gray-100 rounded-full">
                  Antiguos
                </Button>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-gray-500 hover:bg-gray-100 rounded-full">
                  Conversación
                </Button>
              </div>
            </div>

            <div className="p-3">
              {/* Add Comment - More conversational Reddit style */}
              {user && (
                <div className="mb-4">
                  <div className="flex gap-2">
                    <Avatar className="h-7 w-7 shrink-0 mt-1">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-blue-500 text-white text-xs">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 focus-within:border-blue-300 focus-within:bg-white transition-colors">
                        <Textarea
                          placeholder="Únete a la conversación..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="min-h-[80px] resize-none border-0 bg-transparent p-0 text-sm placeholder:text-gray-500 focus-visible:ring-0"
                        />
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600">
                              <Hash className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600">
                              <ImageIcon className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button 
                            onClick={handleSubmitComment}
                            disabled={!newComment.trim() || submittingComment}
                            size="sm"
                            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-3 py-1 h-7 text-xs font-medium"
                          >
                            {submittingComment ? 'Enviando...' : 'Comentar'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border-b border-gray-100 mt-3"></div>
                </div>
              )}

              {/* Comments List - More conversational Reddit style */}
              {comments.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <MessageCircle className="h-8 w-8 mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-medium">Sé el primero en comentar</p>
                  <p className="text-xs">¡Dale vida a esta conversación!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div key={comment.id} className="group relative">
                      {/* Comment Thread */}
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <Avatar className="h-7 w-7">
                            <AvatarImage 
                              src={comment.actor_type === 'user' ? comment.profiles?.avatar_url : comment.organizations?.logo_url} 
                            />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
                              {comment.actor_type === 'user' 
                                ? comment.profiles?.full_name?.charAt(0).toUpperCase()
                                : comment.organizations?.name?.charAt(0).toUpperCase()
                              }
                            </AvatarFallback>
                          </Avatar>
                          {/* Thread line for replies */}
                          <div className="w-px bg-gray-200 flex-1 mt-2 opacity-0 group-hover:opacity-60 transition-opacity"></div>
                        </div>
                        
                        <div className="flex-1 min-w-0 pb-2">
                          {/* Comment Header - More compact */}
                          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                            <span className="font-medium text-gray-800 hover:text-blue-600 cursor-pointer">
                              {comment.actor_type === 'user' ? comment.profiles?.full_name : comment.organizations?.name}
                            </span>
                            <span>•</span>
                            <span>hace {Math.floor((Date.now() - new Date(comment.created_at).getTime()) / (1000 * 60 * 60))}h</span>
                          </div>
                          
                          {/* Comment Content - Better typography */}
                          <div className="text-sm leading-relaxed text-gray-900 mb-2">
                            {comment.content}
                          </div>
                          
                          {/* Comment Actions - More Reddit-like */}
                          <div className="flex items-center gap-1">
                            <div className="flex items-center bg-gray-50 rounded-full px-1">
                              <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-gray-400 hover:text-orange-500 rounded-full">
                                <ArrowLeft className="h-3 w-3 rotate-90" />
                              </Button>
                              <span className="text-xs text-gray-600 px-1 font-medium">{comment.likes_count}</span>
                              <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-gray-400 hover:text-blue-500 rounded-full">
                                <ArrowLeft className="h-3 w-3 -rotate-90" />
                              </Button>
                            </div>
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full font-medium">
                              Responder
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                              Compartir
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 rounded-full ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Reddit style */}
        <div className="w-80 shrink-0">
          {/* Community Info Card */}
          {post.communities && (
            <div className="bg-white rounded-md border border-gray-300 overflow-hidden mb-4">
              {/* Community Header */}
              <div className="bg-blue-500 h-8"></div>
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    r/
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">r/{post.communities.slug}</h3>
                    <p className="text-sm text-gray-500">{post.communities.name}</p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  Una comunidad para profesionales de la hostelería donde puedes hacer preguntas a la gente de España.
                </p>
                
                <div className="flex gap-4 text-sm mb-4">
                  <div>
                    <div className="font-bold text-gray-900">105k</div>
                    <div className="text-gray-500">Miembros</div>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">40</div>
                    <div className="text-gray-500">En línea</div>
                  </div>
                </div>
                
                <Button 
                  variant={myCommunities.some(mc => mc.id === post.community_id) ? "default" : "outline"}
                  className={`w-full mb-2 ${
                    myCommunities.some(mc => mc.id === post.community_id)
                      ? "bg-blue-500 hover:bg-blue-600 text-white"
                      : "border-blue-500 text-blue-500 hover:bg-blue-50"
                  }`}
                  onClick={handleJoinCommunity}
                >
                  {myCommunities.some(mc => mc.id === post.community_id) ? 'Unido' : 'Unirse'}
                </Button>
              </div>
            </div>
          )}

          {/* Community Rules Card */}
          <div className="bg-white rounded-md border border-gray-300 overflow-hidden mb-4">
            <div className="p-4">
              <h3 className="font-bold text-lg mb-4">Reglas de r/{post.communities?.slug}</h3>
              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <span className="text-gray-500">1.</span>
                  <span>No toleramos la discriminación, la intolerancia o la apología de la violencia</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-gray-500">2.</span>
                  <span>No hagas preguntas que no tienen que ver con el subreddit o trolling/spam</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-gray-500">3.</span>
                  <span>No repitas preguntas recientes o haz preguntas que deberían ir en el hilo diario</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}


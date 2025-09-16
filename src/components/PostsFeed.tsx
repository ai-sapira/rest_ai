import { AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, PlusCircle } from "lucide-react";
import { PostCard } from "./PostCard";
import type { Post } from "@/hooks/usePostsSimple";

interface PostsFeedProps {
  posts: Post[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  isLoadingMore: boolean;
  activeTab: string;
  onLike: (postId: string) => void;
  onLoadMore: () => void;
  onRefresh: () => void;
  onCreatePost: () => void;
  formatNumber: (num: number) => string;
}

export function PostsFeed({
  posts,
  loading,
  error,
  hasMore,
  isLoadingMore,
  activeTab,
  onLike,
  onLoadMore,
  onRefresh,
  onCreatePost,
  formatNumber,
}: PostsFeedProps) {
  return (
    <div className="space-y-3">
      {/* ✅ ENHANCED: Error state handling */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-center">
            <p className="text-red-600 mb-2">Error cargando los posts: {error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh}
              className="text-red-600 border-red-300 hover:bg-red-100"
            >
              Reintentar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ✅ ENHANCED: Better loading state handling */}
      {loading && posts.length === 0 && !error && (
        <>
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={`skeleton-${i}`} className="border border-gray-200 shadow-sm bg-white rounded-md overflow-hidden mb-3 animate-pulse">
              <CardContent className="p-4 space-y-3">
                <div className="h-3 w-1/3 bg-gray-200 rounded" />
                <div className="h-4 w-5/6 bg-gray-200 rounded" />
                <div className="h-4 w-2/3 bg-gray-200 rounded" />
                <div className="h-40 w-full bg-gray-100 rounded" />
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-gray-200 rounded" />
                  <div className="h-6 w-20 bg-gray-200 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </>
      )}

      <AnimatePresence>
        {/* ✅ IMPROVED: Show posts even while loading more (pagination) */}
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={onLike}
            formatNumber={formatNumber}
          />
        ))}
      </AnimatePresence>

      {/* ✅ ENHANCED: Load More Button with better states */}
      {hasMore && !error && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="px-6 py-2 text-sm font-medium border-border hover:bg-muted/50 disabled:opacity-50"
          >
            {isLoadingMore ? (
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                Cargando...
              </div>
            ) : (
              "Cargar más"
            )}
          </Button>
        </div>
      )}

      {/* ✅ ENHANCED: Empty State - only show when not loading and no error */}
      {!loading && posts.length === 0 && !error && (
        <Card className="border-dashed border-2 border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted/50 p-3 mb-4">
              <MessageCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No hay posts aún</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
              {activeTab === "red" 
                ? "No hay posts en las comunidades a las que perteneces. ¡Únete a más comunidades o crea el primer post!"
                : "Sé el primero en compartir algo con tu comunidad. ¡Empieza una conversación!"
              }
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onCreatePost}
              className="gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Crear post
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

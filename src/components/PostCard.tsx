import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useNavigationTransition, cardVariants } from "@/hooks/useNavigationTransition";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import type { Post } from "@/hooks/usePostsSimple";

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  formatNumber: (num: number) => string;
}

export function PostCard({ post, onLike, formatNumber }: PostCardProps) {
  const navigate = useNavigate();
  const { navigateWithDelay } = useNavigationTransition();

  return (
    <motion.div
      key={post.id}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover="hover"
      whileTap="tap"
      layout
    >
      <Card data-post-id={post.id} className="border border-gray-300 shadow-sm bg-white rounded-md overflow-hidden mb-3">
        <CardContent className="p-3 sm:p-4">
          {/* Post Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {post.communities && (
                <>
                  <span className="font-semibold text-primary hover:underline cursor-pointer text-xs">
                    r/{post.communities.slug}
                  </span>
                  <span className="text-muted-foreground/60">•</span>
                </>
              )}
              <span className="text-xs">por</span>
              <span className="font-medium text-foreground hover:underline cursor-pointer text-xs">
                u/{post.actor_type === 'user' ? post.profiles?.full_name?.replace(' ', '') : post.organizations?.name?.replace(' ', '')}
              </span>
              <span className="text-muted-foreground/60">•</span>
              <span className="text-xs">{new Date(post.created_at).toLocaleDateString()}</span>
            </div>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </div>

          {/* Post Content */}
          <div
            className="cursor-pointer group -mx-4 px-4 py-2 rounded-lg"
            onClick={() => {
              navigateWithDelay(`/platform/post/${post.id}`);
            }}
          >
            <div className="text-sm leading-relaxed text-foreground mb-3 group-hover:text-primary transition-colors">
              {post.content}
            </div>

            {/* Post Images */}
            {post.post_media && post.post_media.length > 0 && (
              <div className="rounded-lg overflow-hidden border border-border mb-3">
                {post.post_media.map((media, index) => (
                  <img
                    key={index}
                    src={media.url}
                    alt="Post content"
                    className="w-full h-auto max-h-96 object-cover"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 pt-2 border-t border-border/50">
            <Button
              variant="ghost"
              size="sm"
              className={`gap-1.5 h-8 px-3 text-xs hover:bg-muted/50 ${
                post.user_reaction?.length ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onLike(post.id);
              }}
            >
              <Heart className={`h-3.5 w-3.5 ${post.user_reaction?.length ? 'fill-current' : ''}`} />
              <span className="font-medium">{formatNumber(post.likes_count)}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 h-8 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/platform/post/${post.id}`);
              }}
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span className="font-medium">{formatNumber(post.comments_count)}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 h-8 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50"
              onClick={(e) => {
                e.stopPropagation();
                /* TODO: Share functionality */
              }}
            >
              <Share2 className="h-3.5 w-3.5" />
              <span className="font-medium">Compartir</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

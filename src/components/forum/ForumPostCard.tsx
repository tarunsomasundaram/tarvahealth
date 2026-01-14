import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, MoreVertical, Flag, User, Clock } from 'lucide-react';
import { ForumPost } from '@/contexts/ForumContext';
import { useForum } from '@/contexts/ForumContext';
import { ReportSheet } from './ReportSheet';
import { triggerHaptic } from '@/hooks/use-haptics';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ForumPostCardProps {
  post: ForumPost;
  onClick: () => void;
}

export function ForumPostCard({ post, onClick }: ForumPostCardProps) {
  const { likePost } = useForum();
  const [showReport, setShowReport] = useState(false);
  const [liked, setLiked] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!liked) {
      likePost(post.id);
      setLiked(true);
      triggerHaptic('light');
    }
  };

  const handleReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowReport(true);
  };

  return (
    <>
      <motion.button
        onClick={onClick}
        className="w-full card-tarva text-left"
        whileTap={{ scale: 0.99 }}
      >
        {/* Author info */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{post.authorDisplayName}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <button className="p-2 rounded-full hover:bg-secondary">
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border border-border rounded-xl shadow-lg z-50">
              <DropdownMenuItem onClick={handleReport} className="flex items-center gap-2 text-destructive">
                <Flag className="h-4 w-4" />
                Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Shared profile badge */}
        {post.sharedProfile && post.sharedAge && (
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded-full bg-primary/15 text-primary">
              Age: {post.sharedAge < 30 ? '20s' : post.sharedAge < 40 ? '30s' : post.sharedAge < 50 ? '40s' : '50+'}
            </span>
          </div>
        )}

        {/* Post content */}
        <h3 className="font-semibold text-foreground mb-2">{post.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{post.body}</p>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-3 border-t border-border">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              liked ? 'text-pink-500' : 'text-muted-foreground hover:text-pink-500'
            }`}
          >
            <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
            {post.likes + (liked ? 1 : 0)}
          </button>
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MessageCircle className="h-4 w-4" />
            {post.commentCount}
          </span>
        </div>
      </motion.button>

      <ReportSheet
        open={showReport}
        onOpenChange={setShowReport}
        contentType="post"
        contentId={post.id}
      />
    </>
  );
}

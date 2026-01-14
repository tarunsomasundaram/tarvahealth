import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, MessageCircle, Send, User, Clock, Flag, MoreVertical } from 'lucide-react';
import { ForumPost, useForum } from '@/contexts/ForumContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { ReportSheet } from './ReportSheet';
import { CommunityGuidelinesModal } from './CommunityGuidelinesModal';
import { triggerHaptic } from '@/hooks/use-haptics';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ForumPostViewProps {
  post: ForumPost;
  onBack: () => void;
}

export function ForumPostView({ post, onBack }: ForumPostViewProps) {
  const { getCommentsForPost, createComment, likePost, generateAnonymousHandle, hasAcknowledgedGuidelines, userPosts } = useForum();
  const { addNotification } = useOnboarding();
  const [commentText, setCommentText] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [reportContentId, setReportContentId] = useState('');
  const [reportContentType, setReportContentType] = useState<'post' | 'comment'>('post');
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [liked, setLiked] = useState(false);

  const comments = getCommentsForPost(post.id);
  const isOwnPost = userPosts.includes(post.id);

  const handleLike = () => {
    if (!liked) {
      likePost(post.id, (postTitle) => {
        // Notification for likes on own posts
        addNotification({
          id: `forum_like_${Date.now()}`,
          type: 'forum_like',
          title: 'Someone liked your post',
          subtitle: postTitle,
          postTitle,
          timestamp: new Date().toISOString(),
          read: false,
        });
      });
      setLiked(true);
      triggerHaptic('light');
    }
  };

  const handleComment = () => {
    if (!commentText.trim()) return;

    if (!hasAcknowledgedGuidelines) {
      setShowGuidelines(true);
      return;
    }

    const commenterName = generateAnonymousHandle();
    
    createComment({
      postId: post.id,
      authorUserId: 'current-user',
      authorDisplayName: commenterName,
      body: commentText.trim(),
    }, (postTitle, commenter) => {
      // Notification for comments on own posts
      addNotification({
        id: `forum_comment_${Date.now()}`,
        type: 'forum_comment',
        title: `${commenter} commented on your post`,
        subtitle: postTitle,
        postTitle,
        timestamp: new Date().toISOString(),
        read: false,
      });
    });

    setCommentText('');
    triggerHaptic('success');
    toast.success('Comment added!');
  };

  const handleReportPost = () => {
    setReportContentId(post.id);
    setReportContentType('post');
    setShowReport(true);
  };

  const handleReportComment = (commentId: string) => {
    setReportContentId(commentId);
    setReportContentType('comment');
    setShowReport(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <motion.button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-secondary"
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </motion.button>
          <h1 className="font-bold text-lg text-foreground">Post</h1>
        </div>
      </div>

      {/* Post content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 border-b border-border">
          {/* Author */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">{post.authorDisplayName}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-full hover:bg-secondary">
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border border-border rounded-xl shadow-lg z-50">
                <DropdownMenuItem onClick={handleReportPost} className="flex items-center gap-2 text-destructive">
                  <Flag className="h-4 w-4" />
                  Report post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Shared profile badge */}
          {post.sharedProfile && post.sharedAge && (
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xs px-2 py-1 rounded-full bg-primary/15 text-primary">
                Age: {post.sharedAge < 30 ? '20s' : post.sharedAge < 40 ? '30s' : post.sharedAge < 50 ? '40s' : '50+'}
              </span>
            </div>
          )}

          {/* Content */}
          <h2 className="text-xl font-bold text-foreground mb-3">{post.title}</h2>
          <p className="text-foreground whitespace-pre-wrap">{post.body}</p>

          {/* Actions */}
          <div className="flex items-center gap-6 mt-6 pt-4 border-t border-border">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                liked ? 'text-pink-500' : 'text-muted-foreground hover:text-pink-500'
              }`}
            >
              <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
              {post.likes + (liked ? 1 : 0)} likes
            </button>
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageCircle className="h-5 w-5" />
              {comments.length} comments
            </span>
          </div>
        </div>

        {/* Comments */}
        <div className="p-4 space-y-4">
          <h3 className="font-semibold text-foreground">Comments</h3>
          
          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{comment.authorDisplayName}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <button
                        onClick={() => handleReportComment(comment.id)}
                        className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-destructive"
                      >
                        <Flag className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="text-sm text-foreground mt-1">{comment.body}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No comments yet. Be the first!</p>
          )}
        </div>
      </div>

      {/* Comment input */}
      <div className="sticky bottom-0 bg-background border-t border-border p-4">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleComment()}
            className="flex-1 px-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <motion.button
            onClick={handleComment}
            disabled={!commentText.trim()}
            className="p-3 rounded-xl bg-primary text-primary-foreground disabled:opacity-50"
            whileTap={{ scale: commentText.trim() ? 0.9 : 1 }}
          >
            <Send className="h-5 w-5" />
          </motion.button>
        </div>
      </div>

      {/* Modals */}
      <ReportSheet
        open={showReport}
        onOpenChange={setShowReport}
        contentType={reportContentType}
        contentId={reportContentId}
      />

      <CommunityGuidelinesModal
        open={showGuidelines}
        onOpenChange={setShowGuidelines}
        onAccept={() => {
          if (commentText.trim()) {
            createComment({
              postId: post.id,
              authorUserId: 'current-user',
              authorDisplayName: generateAnonymousHandle(),
              body: commentText.trim(),
            });
            setCommentText('');
            triggerHaptic('success');
            toast.success('Comment added!');
          }
        }}
      />
    </div>
  );
}

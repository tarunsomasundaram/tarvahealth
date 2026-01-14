import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, MessageCircle, Send, User, Clock, Flag, MoreVertical, Reply, X, Edit2, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { ForumPost, ForumComment, useForum } from '@/contexts/ForumContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { ReportSheet } from './ReportSheet';
import { EditPostSheet } from './EditPostSheet';
import { EditCommentSheet } from './EditCommentSheet';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { CommunityGuidelinesModal } from './CommunityGuidelinesModal';
import { triggerHaptic } from '@/hooks/use-haptics';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ForumPostViewProps {
  post: ForumPost;
  onBack: () => void;
}

interface CommentItemProps {
  comment: ForumComment;
  replies: ForumComment[];
  onReply: (comment: ForumComment) => void;
  onReport: (commentId: string) => void;
  onEdit: (comment: ForumComment) => void;
  onDelete: (commentId: string) => void;
  onVote: (commentId: string, voteType: 'up' | 'down') => void;
  userVote?: 'up' | 'down';
  isOwn: boolean;
  userComments: string[];
  userVotes: Record<string, 'up' | 'down'>;
  depth?: number;
}

function CommentItem({ 
  comment, 
  replies, 
  onReply, 
  onReport, 
  onEdit, 
  onDelete, 
  onVote,
  userVote,
  isOwn, 
  userComments,
  userVotes,
  depth = 0 
}: CommentItemProps) {
  const [showReplies, setShowReplies] = useState(true);
  const maxDepth = 2;
  
  const voteScore = comment.upvotes - comment.downvotes;
  
  return (
    <div className={depth > 0 ? 'ml-6 border-l-2 border-border pl-4' : ''}>
      <div className="flex gap-3">
        {/* Vote buttons */}
        <div className="flex flex-col items-center gap-0.5 pt-1">
          <button
            onClick={() => onVote(comment.id, 'up')}
            className={`p-1 rounded transition-colors ${
              userVote === 'up' 
                ? 'text-primary bg-primary/10' 
                : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
            }`}
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <span className={`text-xs font-medium ${
            voteScore > 0 ? 'text-primary' : voteScore < 0 ? 'text-destructive' : 'text-muted-foreground'
          }`}>
            {voteScore}
          </span>
          <button
            onClick={() => onVote(comment.id, 'down')}
            className={`p-1 rounded transition-colors ${
              userVote === 'down' 
                ? 'text-destructive bg-destructive/10' 
                : 'text-muted-foreground hover:text-destructive hover:bg-destructive/5'
            }`}
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <User className="h-3 w-3 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium text-foreground">{comment.authorDisplayName}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
              {comment.updatedAt && (
                <span className="text-xs text-muted-foreground">(edited)</span>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded hover:bg-secondary text-muted-foreground">
                  <MoreVertical className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border border-border rounded-xl shadow-lg z-50">
                {isOwn && (
                  <>
                    <DropdownMenuItem onClick={() => onEdit(comment)} className="flex items-center gap-2">
                      <Edit2 className="h-4 w-4" />
                      Edit comment
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(comment.id)} className="flex items-center gap-2 text-destructive">
                      <Trash2 className="h-4 w-4" />
                      Delete comment
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={() => onReport(comment.id)} className="flex items-center gap-2 text-destructive">
                  <Flag className="h-4 w-4" />
                  Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-sm text-foreground mt-1">{comment.body}</p>
          
          {/* Reply button */}
          {depth < maxDepth && (
            <button
              onClick={() => onReply(comment)}
              className="flex items-center gap-1 mt-2 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <Reply className="h-3 w-3" />
              Reply
            </button>
          )}
        </div>
      </div>
      
      {/* Nested replies */}
      {replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {!showReplies ? (
            <button
              onClick={() => setShowReplies(true)}
              className="text-xs text-primary hover:underline ml-11"
            >
              Show {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
            </button>
          ) : (
            <>
              {replies.length > 2 && (
                <button
                  onClick={() => setShowReplies(false)}
                  className="text-xs text-muted-foreground hover:text-foreground ml-11"
                >
                  Hide replies
                </button>
              )}
              {replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  replies={[]}
                  onReply={onReply}
                  onReport={onReport}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onVote={onVote}
                  userVote={userVotes[reply.id]}
                  isOwn={userComments.includes(reply.id)}
                  userComments={userComments}
                  userVotes={userVotes}
                  depth={depth + 1}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function ForumPostView({ post, onBack }: ForumPostViewProps) {
  const { 
    getCommentsForPost, 
    createComment, 
    likePost, 
    editPost,
    deletePost,
    editComment,
    deleteComment,
    voteComment,
    generateAnonymousHandle, 
    hasAcknowledgedGuidelines, 
    userPosts,
    userComments,
    userVotes
  } = useForum();
  const { addNotification } = useOnboarding();
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<ForumComment | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [reportContentId, setReportContentId] = useState('');
  const [reportContentType, setReportContentType] = useState<'post' | 'comment'>('post');
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [liked, setLiked] = useState(false);
  
  // Edit/Delete states
  const [showEditPost, setShowEditPost] = useState(false);
  const [showDeletePost, setShowDeletePost] = useState(false);
  const [showEditComment, setShowEditComment] = useState(false);
  const [showDeleteComment, setShowDeleteComment] = useState(false);
  const [editingComment, setEditingComment] = useState<ForumComment | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  const allComments = getCommentsForPost(post.id);
  
  // Separate top-level comments from replies and sort by vote score
  const topLevelComments = allComments
    .filter(c => !c.parentCommentId)
    .sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
  const getRepliesForComment = (commentId: string) => 
    allComments
      .filter(c => c.parentCommentId === commentId)
      .sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));

  const isOwnPost = userPosts.includes(post.id);

  const handleLike = () => {
    if (!liked) {
      likePost(post.id, (postTitle) => {
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
      parentCommentId: replyingTo?.id,
      authorUserId: 'current-user',
      authorDisplayName: commenterName,
      body: commentText.trim(),
    }, (postTitle, commenter) => {
      addNotification({
        id: `forum_comment_${Date.now()}`,
        type: 'forum_comment',
        title: replyingTo 
          ? `${commenter} replied to a comment`
          : `${commenter} commented on your post`,
        subtitle: postTitle,
        postTitle,
        timestamp: new Date().toISOString(),
        read: false,
      });
    });

    setCommentText('');
    setReplyingTo(null);
    triggerHaptic('success');
    toast.success(replyingTo ? 'Reply added!' : 'Comment added!');
  };

  const handleReply = (comment: ForumComment) => {
    setReplyingTo(comment);
    triggerHaptic('light');
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
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

  const handleEditPost = () => {
    setShowEditPost(true);
  };

  const handleDeletePost = () => {
    setShowDeletePost(true);
  };

  const handleConfirmDeletePost = () => {
    deletePost(post.id);
    triggerHaptic('success');
    toast.success('Post deleted');
    onBack();
  };

  const handleEditComment = (comment: ForumComment) => {
    setEditingComment(comment);
    setShowEditComment(true);
  };

  const handleDeleteComment = (commentId: string) => {
    setDeletingCommentId(commentId);
    setShowDeleteComment(true);
  };

  const handleConfirmDeleteComment = () => {
    if (deletingCommentId) {
      deleteComment(deletingCommentId);
      triggerHaptic('success');
      toast.success('Comment deleted');
      setDeletingCommentId(null);
    }
  };

  const handleVoteComment = (commentId: string, voteType: 'up' | 'down') => {
    voteComment(commentId, voteType);
    triggerHaptic('light');
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
                  {post.updatedAt !== post.createdAt && ' (edited)'}
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
                {isOwnPost && (
                  <>
                    <DropdownMenuItem onClick={handleEditPost} className="flex items-center gap-2">
                      <Edit2 className="h-4 w-4" />
                      Edit post
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDeletePost} className="flex items-center gap-2 text-destructive">
                      <Trash2 className="h-4 w-4" />
                      Delete post
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
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
              {allComments.length} comments
            </span>
          </div>
        </div>

        {/* Comments */}
        <div className="p-4 space-y-4">
          <h3 className="font-semibold text-foreground">Comments</h3>
          
          {topLevelComments.length > 0 ? (
            <div className="space-y-4">
              {topLevelComments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  replies={getRepliesForComment(comment.id)}
                  onReply={handleReply}
                  onReport={handleReportComment}
                  onEdit={handleEditComment}
                  onDelete={handleDeleteComment}
                  onVote={handleVoteComment}
                  userVote={userVotes[comment.id]}
                  isOwn={userComments.includes(comment.id)}
                  userComments={userComments}
                  userVotes={userVotes}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No comments yet. Be the first!</p>
          )}
        </div>
      </div>

      {/* Reply indicator */}
      <AnimatePresence>
        {replyingTo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-secondary/80 backdrop-blur-sm border-t border-border px-4 py-2 flex items-center justify-between"
          >
            <div className="flex items-center gap-2 text-sm">
              <Reply className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Replying to</span>
              <span className="font-medium text-foreground">{replyingTo.authorDisplayName}</span>
            </div>
            <button
              onClick={handleCancelReply}
              className="p-1 rounded hover:bg-background/50"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comment input */}
      <div className="sticky bottom-0 bg-background border-t border-border p-4">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder={replyingTo ? `Reply to ${replyingTo.authorDisplayName}...` : "Add a comment..."}
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
              parentCommentId: replyingTo?.id,
              authorUserId: 'current-user',
              authorDisplayName: generateAnonymousHandle(),
              body: commentText.trim(),
            });
            setCommentText('');
            setReplyingTo(null);
            triggerHaptic('success');
            toast.success(replyingTo ? 'Reply added!' : 'Comment added!');
          }
        }}
      />

      <EditPostSheet
        open={showEditPost}
        onOpenChange={setShowEditPost}
        initialTitle={post.title}
        initialBody={post.body}
        onSave={(title, body) => editPost(post.id, title, body)}
      />

      <DeleteConfirmDialog
        open={showDeletePost}
        onOpenChange={setShowDeletePost}
        title="Delete post?"
        description="This will permanently delete your post and all its comments. This action cannot be undone."
        onConfirm={handleConfirmDeletePost}
      />

      <EditCommentSheet
        open={showEditComment}
        onOpenChange={setShowEditComment}
        initialBody={editingComment?.body || ''}
        onSave={(body) => editingComment && editComment(editingComment.id, body)}
      />

      <DeleteConfirmDialog
        open={showDeleteComment}
        onOpenChange={setShowDeleteComment}
        title="Delete comment?"
        description="This will permanently delete your comment and any replies. This action cannot be undone."
        onConfirm={handleConfirmDeleteComment}
      />
    </div>
  );
}

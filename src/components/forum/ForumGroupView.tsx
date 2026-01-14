import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, AlertTriangle, TrendingUp, Clock, Sparkles } from 'lucide-react';
import { ForumGroup, useForum } from '@/contexts/ForumContext';
import { ForumPostCard } from './ForumPostCard';
import { CreatePostSheet } from './CreatePostSheet';
import { CommunityGuidelinesModal } from './CommunityGuidelinesModal';
import { ForumPostView } from './ForumPostView';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations';
import { triggerHaptic } from '@/hooks/use-haptics';

interface ForumGroupViewProps {
  group: ForumGroup;
  onBack: () => void;
}

type SortTab = 'latest' | 'top' | 'new';

export function ForumGroupView({ group, onBack }: ForumGroupViewProps) {
  const { getPostsForGroup, hasAcknowledgedGuidelines } = useForum();
  const [activeTab, setActiveTab] = useState<SortTab>('latest');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const posts = getPostsForGroup(group.id);
  
  const sortedPosts = [...posts].sort((a, b) => {
    if (activeTab === 'top') {
      return b.likes - a.likes;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleCreatePost = () => {
    triggerHaptic('light');
    if (!hasAcknowledgedGuidelines) {
      setShowGuidelines(true);
    } else {
      setShowCreatePost(true);
    }
  };

  const handleGuidelinesAccept = () => {
    setShowCreatePost(true);
  };

  const tabs: { id: SortTab; label: string; icon: React.ElementType }[] = [
    { id: 'latest', label: 'Latest', icon: Clock },
    { id: 'top', label: 'Top', icon: TrendingUp },
    { id: 'new', label: 'New', icon: Sparkles },
  ];

  if (selectedPostId) {
    const post = posts.find(p => p.id === selectedPostId);
    if (post) {
      return <ForumPostView post={post} onBack={() => setSelectedPostId(null)} />;
    }
  }

  return (
    <div className="min-h-screen bg-background">
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
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-lg text-foreground truncate">{group.name}</h1>
            <p className="text-xs text-muted-foreground">{group.memberCount} members</p>
          </div>
          <motion.button
            onClick={handleCreatePost}
            className="btn-primary px-4 py-2 text-sm"
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Post
          </motion.button>
        </div>

        {/* Disclaimer */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              This is a peer support space. Not medical advice.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-4 pb-3">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => {
                triggerHaptic('light');
                setActiveTab(tab.id);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Posts */}
      <div className="p-4 space-y-3">
        {sortedPosts.length > 0 ? (
          <StaggerContainer className="space-y-3">
            {sortedPosts.map((post) => (
              <StaggerItem key={post.id}>
                <ForumPostCard
                  post={post}
                  onClick={() => setSelectedPostId(post.id)}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <FadeIn>
            <div className="card-tarva text-center py-12">
              <p className="text-muted-foreground mb-4">No posts yet. Be the first to share!</p>
              <motion.button
                onClick={handleCreatePost}
                className="btn-primary"
                whileTap={{ scale: 0.95 }}
              >
                Create first post
              </motion.button>
            </div>
          </FadeIn>
        )}
      </div>

      {/* Modals */}
      <CommunityGuidelinesModal
        open={showGuidelines}
        onOpenChange={setShowGuidelines}
        onAccept={handleGuidelinesAccept}
      />

      <CreatePostSheet
        open={showCreatePost}
        onOpenChange={setShowCreatePost}
        group={group}
      />
    </div>
  );
}

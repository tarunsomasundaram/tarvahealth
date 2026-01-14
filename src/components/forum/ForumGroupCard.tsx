import React from 'react';
import { motion } from 'framer-motion';
import { Users, MessageSquare, ChevronRight } from 'lucide-react';
import { ForumGroup } from '@/contexts/ForumContext';

interface ForumGroupCardProps {
  group: ForumGroup;
  onClick: () => void;
}

export function ForumGroupCard({ group, onClick }: ForumGroupCardProps) {
  return (
    <motion.button
      onClick={onClick}
      className="w-full card-tarva-interactive text-left"
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15">
          <MessageSquare className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{group.name}</h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              {group.memberCount} members
            </span>
            <span className="text-xs text-muted-foreground">
              {group.postCount} posts
            </span>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
      </div>
    </motion.button>
  );
}

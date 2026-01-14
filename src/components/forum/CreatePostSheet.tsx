import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Eye, EyeOff } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { useForum, ForumGroup } from '@/contexts/ForumContext';
import { useHealthProfile } from '@/contexts/HealthProfileContext';
import { triggerHaptic } from '@/hooks/use-haptics';
import { toast } from 'sonner';

interface CreatePostSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: ForumGroup | null;
}

export function CreatePostSheet({ open, onOpenChange, group }: CreatePostSheetProps) {
  const { createPost, generateAnonymousHandle } = useForum();
  const { shareProfileInForum, age, conditions } = useHealthProfile();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [shareProfile, setShareProfile] = useState(false);

  const handleSubmit = () => {
    if (!title.trim() || !body.trim() || !group) return;
    
    createPost({
      groupId: group.id,
      authorUserId: 'current-user',
      authorDisplayName: generateAnonymousHandle(),
      title: title.trim(),
      body: body.trim(),
      isAnonymous: true,
      sharedProfile: shareProfile && shareProfileInForum,
      sharedAge: shareProfile && shareProfileInForum ? age : undefined,
      sharedConditions: shareProfile && shareProfileInForum ? conditions : undefined,
    });
    
    triggerHaptic('success');
    toast.success('Post created!');
    
    setTitle('');
    setBody('');
    setShareProfile(false);
    onOpenChange(false);
  };

  const handleClose = () => {
    setTitle('');
    setBody('');
    setShareProfile(false);
    onOpenChange(false);
  };

  const isValid = title.trim().length > 0 && body.trim().length > 0;

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="rounded-t-3xl h-[85vh] flex flex-col">
        <SheetHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <button onClick={handleClose} className="p-2 -ml-2 rounded-full hover:bg-secondary">
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
            <SheetTitle>New post</SheetTitle>
            <motion.button
              onClick={handleSubmit}
              disabled={!isValid}
              className="p-2 -mr-2 rounded-full disabled:opacity-40"
              whileTap={{ scale: isValid ? 0.9 : 1 }}
            >
              <Send className={`h-5 w-5 ${isValid ? 'text-primary' : 'text-muted-foreground'}`} />
            </motion.button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {group && (
            <div className="px-1">
              <span className="text-xs text-muted-foreground">Posting in</span>
              <p className="font-medium text-foreground">{group.name}</p>
            </div>
          )}

          <div>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent text-lg font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none"
              maxLength={100}
            />
          </div>

          <div className="flex-1">
            <textarea
              placeholder="Share your experience..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full h-40 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none resize-none"
              maxLength={2000}
            />
          </div>

          <div className="p-4 rounded-2xl bg-secondary/50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {shareProfile ? (
                  <Eye className="h-5 w-5 text-primary" />
                ) : (
                  <EyeOff className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium text-foreground">Share profile details</p>
                  <p className="text-xs text-muted-foreground">
                    Show age range & conditions with this post
                  </p>
                </div>
              </div>
              <Switch
                checked={shareProfile}
                onCheckedChange={setShareProfile}
                disabled={!shareProfileInForum}
              />
            </div>
            
            {!shareProfileInForum && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Enable "Share my profile in Forum" in Profile settings to use this feature.
              </p>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
            <p className="text-xs text-primary">
              <strong>Remember:</strong> You're posting anonymously. Be kind, share experiences, and avoid giving medical advice.
            </p>
          </div>
        </div>

        <div className="flex-shrink-0 pt-4 border-t border-border">
          <motion.button
            onClick={handleSubmit}
            disabled={!isValid}
            className="w-full btn-primary py-4 disabled:opacity-50"
            whileTap={{ scale: isValid ? 0.98 : 1 }}
          >
            Post
          </motion.button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

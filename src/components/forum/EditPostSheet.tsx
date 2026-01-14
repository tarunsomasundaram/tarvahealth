import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { triggerHaptic } from '@/hooks/use-haptics';

interface EditPostSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTitle: string;
  initialBody: string;
  onSave: (title: string, body: string) => void;
}

export function EditPostSheet({ open, onOpenChange, initialTitle, initialBody, onSave }: EditPostSheetProps) {
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);

  useEffect(() => {
    setTitle(initialTitle);
    setBody(initialBody);
  }, [initialTitle, initialBody]);

  const handleSave = () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Title and content are required');
      return;
    }
    onSave(title.trim(), body.trim());
    triggerHaptic('success');
    toast.success('Post updated!');
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
        <SheetHeader className="mb-4">
          <SheetTitle>Edit Post</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Title</label>
            <Input
              placeholder="Post title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Content</label>
            <Textarea
              placeholder="What's on your mind?"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-[200px] rounded-xl resize-none"
            />
          </div>
          
          <Button 
            onClick={handleSave}
            className="w-full rounded-xl"
            disabled={!title.trim() || !body.trim()}
          >
            Save Changes
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

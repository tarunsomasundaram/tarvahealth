import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { triggerHaptic } from '@/hooks/use-haptics';

interface EditCommentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialBody: string;
  onSave: (body: string) => void;
}

export function EditCommentSheet({ open, onOpenChange, initialBody, onSave }: EditCommentSheetProps) {
  const [body, setBody] = useState(initialBody);

  useEffect(() => {
    setBody(initialBody);
  }, [initialBody]);

  const handleSave = () => {
    if (!body.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }
    onSave(body.trim());
    triggerHaptic('success');
    toast.success('Comment updated!');
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[50vh] rounded-t-3xl">
        <SheetHeader className="mb-4">
          <SheetTitle>Edit Comment</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-4">
          <Textarea
            placeholder="Your comment..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="min-h-[150px] rounded-xl resize-none"
          />
          
          <Button 
            onClick={handleSave}
            className="w-full rounded-xl"
            disabled={!body.trim()}
          >
            Save Changes
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

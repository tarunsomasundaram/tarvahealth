import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Flag, Check } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useForum } from '@/contexts/ForumContext';
import { triggerHaptic } from '@/hooks/use-haptics';
import { toast } from 'sonner';

interface ReportSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentType: 'post' | 'comment';
  contentId: string;
}

const reportReasons = [
  'Harassment or bullying',
  'Spam or advertising',
  'Misinformation',
  'Medical advice',
  'Inappropriate content',
  'Other',
];

export function ReportSheet({ open, onOpenChange, contentType, contentId }: ReportSheetProps) {
  const { reportContent } = useForum();
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!selectedReason) return;
    
    reportContent({
      contentType,
      contentId,
      reporterUserId: 'current-user', // Would come from auth context
      reason: selectedReason,
    });
    
    triggerHaptic('success');
    setSubmitted(true);
    
    setTimeout(() => {
      setSubmitted(false);
      setSelectedReason(null);
      onOpenChange(false);
      toast.success('Report submitted', {
        description: 'Thank you for helping keep our community safe.',
      });
    }, 1500);
  };

  const handleClose = () => {
    setSubmitted(false);
    setSelectedReason(null);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetHeader className="text-center pb-4">
          <SheetTitle className="flex items-center justify-center gap-2">
            <Flag className="h-5 w-5 text-destructive" />
            Report {contentType}
          </SheetTitle>
        </SheetHeader>

        {submitted ? (
          <motion.div
            className="py-12 flex flex-col items-center gap-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <p className="text-lg font-semibold text-foreground">Report submitted</p>
            <p className="text-muted-foreground text-center">
              Thank you for helping keep our community safe.
            </p>
          </motion.div>
        ) : (
          <>
            <p className="text-muted-foreground text-center mb-6">
              Why are you reporting this {contentType}?
            </p>

            <div className="space-y-2 mb-6">
              {reportReasons.map((reason) => (
                <motion.button
                  key={reason}
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedReason(reason);
                  }}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    selectedReason === reason
                      ? 'bg-primary/15 border-2 border-primary'
                      : 'bg-secondary border-2 border-transparent hover:bg-secondary/80'
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className={selectedReason === reason ? 'text-primary font-medium' : 'text-foreground'}>
                    {reason}
                  </span>
                </motion.button>
              ))}
            </div>

            <motion.button
              onClick={handleSubmit}
              disabled={!selectedReason}
              className="w-full btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              whileTap={{ scale: selectedReason ? 0.98 : 1 }}
            >
              Submit report
            </motion.button>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

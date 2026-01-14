import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Heart, MessageCircle, AlertTriangle } from 'lucide-react';
import { useForum } from '@/contexts/ForumContext';

interface CommunityGuidelinesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept?: () => void;
}

export function CommunityGuidelinesModal({ open, onOpenChange, onAccept }: CommunityGuidelinesModalProps) {
  const { acknowledgeGuidelines } = useForum();

  const handleAccept = () => {
    acknowledgeGuidelines();
    onAccept?.();
    onOpenChange(false);
  };

  const guidelines = [
    {
      icon: Heart,
      title: 'Be respectful',
      description: 'Treat everyone with kindness and empathy. We\'re all here to support each other.',
    },
    {
      icon: Shield,
      title: 'No harassment',
      description: 'Bullying, discrimination, or any form of harassment will not be tolerated.',
    },
    {
      icon: MessageCircle,
      title: 'Share personal experience only',
      description: 'Share your own journey and experiences. Avoid giving specific medical recommendations.',
    },
    {
      icon: AlertTriangle,
      title: 'Not medical advice',
      description: 'This community does not replace professional medical advice. Always consult your healthcare provider.',
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-lg bg-background rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[90vh] flex flex-col"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">Community Guidelines</h2>
              <button
                onClick={() => onOpenChange(false)}
                className="p-2 rounded-full hover:bg-secondary transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <p className="text-muted-foreground">
                Welcome to the TARVA community! Before you start posting, please read and acknowledge our guidelines.
              </p>

              <div className="space-y-4">
                {guidelines.map((guideline, index) => (
                  <motion.div
                    key={guideline.title}
                    className="flex gap-4 p-4 rounded-2xl bg-secondary/50"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                      <guideline.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{guideline.title}</h3>
                      <p className="text-sm text-muted-foreground">{guideline.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  <strong>Important:</strong> Content that violates these guidelines may be removed, and users may be restricted from the community.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border">
              <motion.button
                onClick={handleAccept}
                className="w-full btn-primary py-4 text-base font-semibold"
                whileTap={{ scale: 0.98 }}
              >
                I understand and agree
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

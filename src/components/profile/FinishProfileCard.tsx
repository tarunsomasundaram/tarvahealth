import React from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, ChevronRight } from 'lucide-react';
import { useHealthProfile } from '@/contexts/HealthProfileContext';
import { useNavigate } from 'react-router-dom';

interface FinishProfileCardProps {
  onDismiss?: () => void;
}

export function FinishProfileCard({ onDismiss }: FinishProfileCardProps) {
  const navigate = useNavigate();
  const { getProfileCompletionPercentage, profileCompleted } = useHealthProfile();
  const completionPercentage = getProfileCompletionPercentage();

  // Don't show if profile is marked complete or at 100%
  if (profileCompleted || completionPercentage >= 100) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="card-tarva bg-gradient-to-br from-primary/10 to-accent-pink/10 border border-primary/20 relative overflow-hidden"
    >
      {/* Dismiss button */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-background/80 hover:bg-background transition-colors"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      )}

      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground mb-1">Finish your profile</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Complete your health profile to get personalized insights and connect with others
          </p>
          
          {/* Progress bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-primary">{completionPercentage}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-accent-pink rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </div>
          </div>
          
          <motion.button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            whileTap={{ scale: 0.98 }}
          >
            Continue setup
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

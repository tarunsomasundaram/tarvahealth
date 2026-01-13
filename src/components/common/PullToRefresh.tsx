import { useState, useRef, ReactNode } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { triggerHaptic } from '@/hooks/use-haptics';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
}

const PULL_THRESHOLD = 80;
const MAX_PULL = 120;

export function PullToRefresh({ children, onRefresh, className }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useMotionValue(0);
  
  const pullProgress = useTransform(currentY, [0, PULL_THRESHOLD], [0, 1]);
  const rotation = useTransform(currentY, [0, PULL_THRESHOLD], [0, 180]);
  const opacity = useTransform(currentY, [0, 40, PULL_THRESHOLD], [0, 0.5, 1]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0 && !isRefreshing) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || isRefreshing) return;
    
    const delta = Math.max(0, e.touches[0].clientY - startY.current);
    const resistance = 0.5;
    const resistedDelta = Math.min(delta * resistance, MAX_PULL);
    currentY.set(resistedDelta);
    
    if (resistedDelta >= PULL_THRESHOLD) {
      triggerHaptic('light');
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling) return;
    
    const currentPull = currentY.get();
    
    if (currentPull >= PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      triggerHaptic('medium');
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setIsPulling(false);
    currentY.set(0);
  };

  return (
    <div
      ref={containerRef}
      className={className}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence>
        {(isPulling || isRefreshing) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: isRefreshing ? 60 : currentY.get(), opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex items-center justify-center overflow-hidden"
          >
            <motion.div
              style={{ opacity, rotate: isRefreshing ? undefined : rotation }}
              animate={isRefreshing ? { rotate: 360 } : undefined}
              transition={isRefreshing ? { repeat: Infinity, duration: 1, ease: 'linear' } : undefined}
            >
              <RefreshCw className="h-6 w-6 text-primary" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </div>
  );
}

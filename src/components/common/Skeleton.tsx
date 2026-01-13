import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-xl bg-muted",
        className
      )}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{ translateX: ['calc(-100%)', 'calc(100%)'] }}
        transition={{ 
          repeat: Infinity, 
          duration: 1.5, 
          ease: 'easeInOut',
          repeatDelay: 0.5
        }}
      />
    </motion.div>
  );
}

// Preset skeleton components for common UI patterns
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("card-tarva space-y-4", className)}>
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonMedicationCard() {
  return (
    <div className="card-tarva">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 flex-1 rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonProgressCard() {
  return (
    <div className="card-hero">
      <div className="space-y-4">
        <Skeleton className="h-6 w-40 bg-white/20" />
        <Skeleton className="h-12 w-24 bg-white/20" />
        <Skeleton className="h-2 w-full rounded-full bg-white/20" />
      </div>
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="card-tarva space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function SkeletonProfileHeader() {
  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <Skeleton className="h-24 w-24 rounded-full" />
      <div className="space-y-2 text-center">
        <Skeleton className="h-6 w-32 mx-auto" />
        <Skeleton className="h-4 w-20 mx-auto" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

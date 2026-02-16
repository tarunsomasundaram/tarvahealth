import { motion } from "framer-motion";

interface AdherenceRingProps {
  percentage: number;
  label: string;
  sublabel?: string;
}

function getRingColor(pct: number): string {
  if (pct >= 90) return "hsl(145 55% 45%)";
  if (pct >= 70) return "hsl(258 70% 65%)";
  if (pct >= 50) return "hsl(38 90% 50%)";
  return "hsl(0 65% 50%)";
}

export function AdherenceRing({ percentage, label, sublabel }: AdherenceRingProps) {
  const size = 180;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const color = getRingColor(percentage);

  return (
    <div className="card-tarva flex flex-col items-center py-6 relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${color}, transparent 70%)`,
        }}
      />
      <div className="relative" style={{ width: size, height: size }}>
        {/* Track */}
        <svg width={size} height={size} className="rotate-[-90deg]">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
            style={{
              filter: `drop-shadow(0 0 8px ${color})`,
            }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-[40px] font-bold text-foreground leading-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {percentage}%
          </motion.span>
          <span
            className="text-[11px] font-bold uppercase tracking-[0.15em] mt-1"
            style={{ color }}
          >
            {label}
          </span>
        </div>
      </div>
      {sublabel && (
        <p className="text-small mt-3 text-center">{sublabel}</p>
      )}
    </div>
  );
}

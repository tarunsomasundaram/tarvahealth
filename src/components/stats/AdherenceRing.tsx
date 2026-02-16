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
  const size = 72;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const color = getRingColor(percentage);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
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
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            style={{
              filter: `drop-shadow(0 0 6px ${color})`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-[16px] font-bold text-foreground leading-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {percentage}%
          </motion.span>
        </div>
      </div>
      <span
        className="text-[10px] font-bold uppercase tracking-[0.1em]"
        style={{ color }}
      >
        {label}
      </span>
      {sublabel && (
        <p className="text-[10px] text-muted-foreground">{sublabel}</p>
      )}
    </div>
  );
}

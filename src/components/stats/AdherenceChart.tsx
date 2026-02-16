import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useMemo } from "react";

interface AdherenceChartProps {
  data: { day: string; adherence: number }[];
}

// Determine gradient color based on slope between consecutive points
function getSlopeColor(curr: number, prev: number): string {
  const diff = curr - prev;
  if (diff > 5) return "hsl(145 55% 45%)";       // rising → green
  if (diff < -5) return "hsl(0 65% 50%)";         // falling → red
  return "hsl(258 70% 65%)";                       // flat → primary purple
}

export function AdherenceChart({ data }: AdherenceChartProps) {
  // Build gradient stops based on slope between data points
  const gradientStops = useMemo(() => {
    if (data.length < 2) return [{ offset: "0%", color: "hsl(258 70% 65%)" }];
    
    const stops: { offset: string; color: string }[] = [];
    for (let i = 0; i < data.length; i++) {
      const pct = `${Math.round((i / (data.length - 1)) * 100)}%`;
      if (i === 0) {
        const color = getSlopeColor(data[1].adherence, data[0].adherence);
        stops.push({ offset: pct, color });
      } else {
        const color = getSlopeColor(data[i].adherence, data[i - 1].adherence);
        stops.push({ offset: pct, color });
      }
    }
    return stops;
  }, [data]);

  return (
    <div className="card-tarva relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-success via-primary to-accent-pink rounded-t-[18px]" />

      <h3 className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-4">Weekly Adherence</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                {gradientStops.map((stop, i) => (
                  <stop key={i} offset={stop.offset} stopColor={stop.color} />
                ))}
              </linearGradient>
              <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(258 75% 58%)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="hsl(258 75% 58%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                boxShadow: "var(--shadow-card)",
              }}
              formatter={(value: number) => [`${value}%`, "Adherence"]}
            />
            <Area
              type="monotone"
              dataKey="adherence"
              stroke="url(#lineGradient)"
              strokeWidth={3}
              fill="url(#fillGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-border/50">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-success" />
          <span className="text-[10px] text-muted-foreground font-medium">Rising</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-[10px] text-muted-foreground font-medium">Steady</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-destructive" />
          <span className="text-[10px] text-muted-foreground font-medium">Falling</span>
        </div>
      </div>
    </div>
  );
}

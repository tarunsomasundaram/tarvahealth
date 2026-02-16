import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";

interface AdherenceChartProps {
  data: { day: string; adherence: number }[];
}

function getBarColor(value: number): string {
  if (value >= 90) return "hsl(145 55% 45%)";      // success green
  if (value >= 70) return "hsl(258 70% 65%)";       // primary purple
  if (value >= 50) return "hsl(38 90% 50%)";        // warning amber
  return "hsl(0 65% 50%)";                          // destructive red
}

export function AdherenceChart({ data }: AdherenceChartProps) {
  return (
    <div className="card-tarva relative overflow-hidden">
      {/* Subtle top accent */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-success via-primary to-accent-pink rounded-t-[18px]" />
      
      <h3 className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">Weekly Adherence</h3>
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-[28px] font-bold text-foreground">
          {data.length > 0 ? `${Math.round(data.reduce((s, d) => s + d.adherence, 0) / data.length)}%` : '—'}
        </span>
        <span className="text-small">avg this week</span>
      </div>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }} barCategoryGap="25%">
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))", fontWeight: 500 }}
            />
            <YAxis
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(v) => `${v}%`}
              ticks={[0, 50, 100]}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                boxShadow: "var(--shadow-card)",
                fontSize: "13px",
              }}
              formatter={(value: number) => [`${value}%`, "Adherence"]}
            />
            <Bar dataKey="adherence" radius={[6, 6, 2, 2]} maxBarSize={32}>
              {data.map((entry, index) => (
                <Cell key={index} fill={getBarColor(entry.adherence)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-border/50">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-success" />
          <span className="text-[10px] text-muted-foreground font-medium">90%+</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-[10px] text-muted-foreground font-medium">70-89%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-warning" />
          <span className="text-[10px] text-muted-foreground font-medium">50-69%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-destructive" />
          <span className="text-[10px] text-muted-foreground font-medium">&lt;50%</span>
        </div>
      </div>
    </div>
  );
}

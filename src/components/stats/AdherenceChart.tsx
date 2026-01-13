import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

interface AdherenceChartProps {
  data: { day: string; adherence: number }[];
}

export function AdherenceChart({ data }: AdherenceChartProps) {
  return (
    <div className="card-tarva">
      <h3 className="text-section text-foreground mb-4">Weekly Adherence</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="adherenceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(258 75% 58%)" stopOpacity={0.4} />
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
              stroke="hsl(258 75% 58%)"
              strokeWidth={3}
              fill="url(#adherenceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Props = { data: { meal: string; mood: number; energy: number; calories: number }[] };

export function MoodScatterChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <ScatterChart margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
        <XAxis
          dataKey="mood"
          name="Mood"
          type="number"
          domain={[1, 5]}
          tick={{ fontSize: 11, fill: "#a1a1aa" }}
          axisLine={false}
          tickLine={false}
          label={{ value: "Mood", position: "insideBottom", offset: -2, fontSize: 10, fill: "#a1a1aa" }}
        />
        <YAxis
          dataKey="energy"
          name="Energy"
          type="number"
          domain={[1, 5]}
          tick={{ fontSize: 11, fill: "#a1a1aa" }}
          axisLine={false}
          tickLine={false}
          label={{ value: "Energy", angle: -90, position: "insideLeft", fontSize: 10, fill: "#a1a1aa" }}
        />
        <Tooltip
          cursor={{ strokeDasharray: "3 3" }}
          contentStyle={{
            background: "#18181b",
            border: "1px solid #3f3f46",
            borderRadius: "8px",
            fontSize: 12,
            color: "#f4f4f5",
          }}
          content={({ payload }) => {
            if (!payload?.length) return null;
            const d = payload[0].payload;
            return (
              <div className="p-2 text-xs">
                <p className="font-medium mb-1">{d.meal}</p>
                <p>Mood: {d.mood} · Energy: {d.energy}</p>
                <p className="text-muted-foreground">{d.calories} kcal</p>
              </div>
            );
          }}
        />
        <Scatter data={data} fill="#10b981" opacity={0.8} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

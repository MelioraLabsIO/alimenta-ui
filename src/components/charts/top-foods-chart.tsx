"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type Props = { data: { food: string; count: number }[] };

const COLORS = [
  "#10b981", "#34d399", "#6ee7b7", "#a7f3d0",
  "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe",
];

export function TopFoodsChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: "#a1a1aa" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          dataKey="food"
          type="category"
          width={110}
          tick={{ fontSize: 11, fill: "#a1a1aa" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "#18181b",
            border: "1px solid #3f3f46",
            borderRadius: "8px",
            fontSize: 12,
            color: "#f4f4f5",
          }}
          labelStyle={{ color: "#f4f4f5" }}
          itemStyle={{ color: "#f4f4f5" }}
          formatter={(v: number | undefined, _name: string | undefined) => [v != null ? `${v} times` : "—", "Logged"]}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

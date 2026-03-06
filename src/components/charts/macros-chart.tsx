"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type Props = { data: { name: string; value: number }[] };

const COLORS = ["#10b981", "#3b82f6", "#f59e0b"];

export function MacrosChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={50}
          outerRadius={75}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
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
          formatter={(value: number | undefined, name: string | undefined) => [value != null ? `${value}g` : "—", name ?? ""]}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

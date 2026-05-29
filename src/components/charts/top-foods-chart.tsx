"use client";

type Props = { data: { food: string; count: number }[] };

const COLORS = ["#58d1a0", "#60a5fa", "#fbbf24", "#ff91b5", "#8be4bd", "#93c5fd"];

export function TopFoodsChart({data}: Props) {
    const max = Math.max(...data.map((item) => item.count), 1);

    return (
        <div className="flex h-[220px] flex-col justify-center gap-3">
            {data.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground">Log meals to see your top foods.</p>
            ) : data.map((item, index) => (
                <div key={item.food} className="grid grid-cols-[110px_1fr_28px] items-center gap-3 text-xs">
                    <span className="truncate text-muted-foreground">{item.food}</span>
                    <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full rounded-full"
                            style={{
                                width: `${Math.max(8, (item.count / max) * 100)}%`,
                                background: `linear-gradient(90deg, ${COLORS[index % COLORS.length]}, color-mix(in srgb, ${COLORS[index % COLORS.length]} 42%, transparent))`,
                            }}
                        />
                    </div>
                    <span className="font-semibold text-foreground">{item.count}</span>
                </div>
            ))}
        </div>
    );
}

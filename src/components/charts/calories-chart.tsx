"use client";

type Props = { data: { date: string; calories: number }[] };

export function CaloriesChart({data}: Props) {
    const values = data.length ? data : [{date: "Today", calories: 0}];
    const max = Math.max(...values.map((item) => item.calories), 1);
    const width = 640;
    const height = 200;
    const padding = {top: 18, right: 18, bottom: 32, left: 34};
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const points = values.map((item, index) => {
        const x = padding.left + (values.length === 1 ? chartWidth / 2 : (index / (values.length - 1)) * chartWidth);
        const y = padding.top + chartHeight - (item.calories / max) * chartHeight;
        return {x, y, ...item};
    });
    const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

    return (
        <div className="h-[200px] w-full">
            <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full overflow-visible">
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                    const y = padding.top + chartHeight - ratio * chartHeight;
                    return (
                        <g key={ratio}>
                            <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="var(--border)" strokeDasharray="4 8" opacity="0.55"/>
                            <text x={8} y={y + 4} className="fill-muted-foreground text-[10px]">{Math.round(max * ratio)}</text>
                        </g>
                    );
                })}
                <path d={path} fill="none" stroke="url(#calories-line)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                {points.map((point) => (
                    <circle key={`${point.date}-${point.x}`} cx={point.x} cy={point.y} r="4" fill="#58d1a0" stroke="var(--card)" strokeWidth="3"/>
                ))}
                {points.map((point, index) => (
                    <text key={point.date} x={point.x} y={height - 8} textAnchor={index === 0 ? "start" : index === points.length - 1 ? "end" : "middle"} className="fill-muted-foreground text-[11px]">
                        {point.date}
                    </text>
                ))}
                <defs>
                    <linearGradient id="calories-line" x1="0" x2="1">
                        <stop offset="0%" stopColor="#58d1a0"/>
                        <stop offset="55%" stopColor="#60a5fa"/>
                        <stop offset="100%" stopColor="#fbbf24"/>
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
}

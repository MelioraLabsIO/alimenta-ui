"use client";

type Props = { data: { meal: string; mood: number; energy: number; calories: number }[] };

export function MoodScatterChart({data}: Props) {
    const width = 320;
    const height = 200;
    const padding = 28;
    const scale = (value: number) => padding + ((value - 1) / 4) * (width - padding * 2);
    const scaleY = (value: number) => height - padding - ((value - 1) / 4) * (height - padding * 2);

    return (
        <div className="h-[200px] w-full">
            <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
                {[1, 2, 3, 4, 5].map((tick) => (
                    <g key={tick}>
                        <line x1={scale(tick)} x2={scale(tick)} y1={padding} y2={height - padding} stroke="var(--border)" opacity="0.45"/>
                        <line x1={padding} x2={width - padding} y1={scaleY(tick)} y2={scaleY(tick)} stroke="var(--border)" opacity="0.45"/>
                        <text x={scale(tick)} y={height - 7} textAnchor="middle" className="fill-muted-foreground text-[10px]">{tick}</text>
                        <text x={9} y={scaleY(tick) + 4} className="fill-muted-foreground text-[10px]">{tick}</text>
                    </g>
                ))}
                {data.map((item, index) => (
                    <circle
                        key={`${item.meal}-${index}`}
                        cx={scale(item.mood)}
                        cy={scaleY(item.energy)}
                        r={Math.max(4, Math.min(10, item.calories / 140))}
                        fill={index % 2 === 0 ? "#58d1a0" : "#60a5fa"}
                        opacity="0.85"
                    />
                ))}
                <text x={width / 2} y={height - 1} textAnchor="middle" className="fill-muted-foreground text-[10px]">Mood</text>
                <text x={12} y={height / 2} textAnchor="middle" className="fill-muted-foreground text-[10px]" transform={`rotate(-90 12 ${height / 2})`}>Energy</text>
            </svg>
        </div>
    );
}

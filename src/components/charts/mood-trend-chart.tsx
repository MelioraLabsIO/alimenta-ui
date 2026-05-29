"use client";

type Props = { data: { date: string; mood: number; energy: number }[] };

function buildPath(data: { date: string; value: number }[], width: number, height: number, padding: number) {
    return data.map((point, index) => {
        const x = padding + (data.length === 1 ? (width - padding * 2) / 2 : (index / (data.length - 1)) * (width - padding * 2));
        const y = height - padding - (point.value / 5) * (height - padding * 2);
        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    }).join(" ");
}

export function MoodTrendChart({data}: Props) {
    const width = 520;
    const height = 220;
    const padding = 28;
    const mood = data.map((item) => ({date: item.date, value: item.mood}));
    const energy = data.map((item) => ({date: item.date, value: item.energy}));

    return (
        <div className="h-[220px] w-full">
            <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
                {[0, 1, 2, 3, 4, 5].map((tick) => {
                    const y = height - padding - (tick / 5) * (height - padding * 2);
                    return <line key={tick} x1={padding} x2={width - padding} y1={y} y2={y} stroke="var(--border)" strokeDasharray="4 8" opacity="0.5"/>;
                })}
                <path d={buildPath(mood, width, height, padding)} fill="none" stroke="#58d1a0" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                <path d={buildPath(energy, width, height, padding)} fill="none" stroke="#60a5fa" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                <g className="text-[11px]">
                    <circle cx={width - 110} cy="18" r="4" fill="#58d1a0"/><text x={width - 100} y="22" className="fill-muted-foreground">Mood</text>
                    <circle cx={width - 60} cy="18" r="4" fill="#60a5fa"/><text x={width - 50} y="22" className="fill-muted-foreground">Energy</text>
                </g>
            </svg>
        </div>
    );
}

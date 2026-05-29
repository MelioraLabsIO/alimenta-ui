"use client";

type Props = { data: { name: string; value: number }[] };

const COLORS = ["#58d1a0", "#60a5fa", "#fbbf24"];

export function MacrosChart({data}: Props) {
    const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
    const radius = 56;
    const circumference = 2 * Math.PI * radius;
    const segments = data.reduce<{ item: Props["data"][number]; length: number; offset: number }[]>((acc, item) => {
        const previousOffset = acc.reduce((sum, segment) => sum + segment.length, 0);
        return [...acc, {item, length: (item.value / total) * circumference, offset: previousOffset}];
    }, []);

    return (
        <div className="flex h-[200px] items-center justify-center gap-6">
            <svg viewBox="0 0 160 160" className="h-40 w-40 -rotate-90">
                <circle cx="80" cy="80" r={radius} fill="none" stroke="var(--muted)" strokeWidth="18"/>
                {segments.map(({item, length, offset}, index) => (
                        <circle
                            key={item.name}
                            cx="80"
                            cy="80"
                            r={radius}
                            fill="none"
                            stroke={COLORS[index % COLORS.length]}
                            strokeWidth="18"
                            strokeLinecap="round"
                            strokeDasharray={`${length} ${circumference - length}`}
                            strokeDashoffset={-offset}
                        />
                ))}
                <text x="80" y="76" textAnchor="middle" className="rotate-90 fill-foreground text-[20px] font-bold" transform="rotate(90 80 80)">
                    {Math.round(total)}g
                </text>
                <text x="80" y="94" textAnchor="middle" className="rotate-90 fill-muted-foreground text-[10px]" transform="rotate(90 80 80)">
                    total
                </text>
            </svg>
            <div className="space-y-2">
                {data.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2 text-xs">
                        <span className="h-2.5 w-2.5 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}/>
                        <span className="text-muted-foreground">{item.name}</span>
                        <span className="font-semibold text-foreground">{item.value}g</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

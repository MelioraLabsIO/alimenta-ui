"use client";

import {useEffect, useRef, useState} from "react";
import {Button} from "@/components/mantine/ui";
import {Dices} from "lucide-react";

const WHEEL_COLORS = [
    "#58d1a0",
    "#60a5fa",
    "#fbbf24",
    "#f472b6",
    "#a78bfa",
    "#34d399",
    "#fb923c",
    "#38bdf8",
    "#e879f9",
    "#4ade80",
];

const SPIN_DURATION_MS = 3500;
const SPIN_ROTATIONS = 6;
const MAX_LABEL_LENGTH = 10;
const PRIMARY_COLOR = "#58d1a0";
const WHEEL_CENTER_X = 150;
const WHEEL_CENTER_Y = 150;
const WHEEL_RADIUS = 140;
const POINTER_WIDTH = 20;
const POINTER_HEIGHT = 24;

export type WheelSegment = {
    label: string;
};

interface MealPickerWheelProps {
    segments: WheelSegment[];
    onResult?: (label: string, index: number) => void;
}

function describeSegmentPath(
    cx: number,
    cy: number,
    r: number,
    startAngleDeg: number,
    endAngleDeg: number,
): string {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startAngleDeg));
    const y1 = cy + r * Math.sin(toRad(startAngleDeg));
    const x2 = cx + r * Math.cos(toRad(endAngleDeg));
    const y2 = cy + r * Math.sin(toRad(endAngleDeg));
    const largeArc = endAngleDeg - startAngleDeg > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

function truncateLabel(label: string): string {
    return label.length > MAX_LABEL_LENGTH ? label.slice(0, MAX_LABEL_LENGTH) + "…" : label;
}

export function MealPickerWheel({segments, onResult}: MealPickerWheelProps) {
    const [cumulativeRotation, setCumulativeRotation] = useState(0);
    const [spinning, setSpinning] = useState(false);
    const [winner, setWinner] = useState<{label: string; index: number} | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const n = segments.length;
    const cx = WHEEL_CENTER_X;
    const cy = WHEEL_CENTER_Y;
    const r = WHEEL_RADIUS;

    // Clear any pending timer on unmount to prevent state updates after unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    function handleSpin() {
        if (spinning || n === 0) return;

        const winnerIndex = Math.floor(Math.random() * n);
        const segAngle = 360 / n;

        // Center of the winning segment (degrees clockwise from top = 12 o'clock)
        const winnerCenter = (winnerIndex + 0.5) * segAngle;

        // To bring winnerCenter to the pointer (top), we need a clockwise rotation of:
        //   (360 - winnerCenter) % 360
        // plus extra full spins.
        const basicTarget = (360 - winnerCenter) % 360;
        const currentMod = cumulativeRotation % 360;
        let delta = basicTarget - currentMod;
        if (delta <= 0) delta += 360;
        delta += SPIN_ROTATIONS * 360;

        const newRotation = cumulativeRotation + delta;

        setSpinning(true);
        setWinner(null);
        setCumulativeRotation(newRotation);

        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            setSpinning(false);
            setWinner({label: segments[winnerIndex].label, index: winnerIndex});
            onResult?.(segments[winnerIndex].label, winnerIndex);
        }, SPIN_DURATION_MS);
    }

    if (n === 0) {
        return (
            <div className="flex flex-col items-center gap-4 py-8">
                <p className="text-sm text-muted-foreground">No meals available to spin.</p>
            </div>
        );
    }

    const segAngle = 360 / n;

    return (
        <div className="flex flex-col items-center gap-5">
            {/* Wheel + pointer */}
            <div className="relative inline-block">
                {/* Pointer arrow pointing down into wheel */}
                <div
                    className="absolute top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-[6px]"
                    aria-hidden="true"
                >
                    <svg
                        width={POINTER_WIDTH}
                        height={POINTER_HEIGHT}
                        viewBox={`0 0 ${POINTER_WIDTH} ${POINTER_HEIGHT}`}
                    >
                        <polygon
                            points={`${POINTER_WIDTH / 2},${POINTER_HEIGHT - 2} 0,2 ${POINTER_WIDTH},2`}
                            fill={PRIMARY_COLOR}
                            stroke="white"
                            strokeWidth="1.5"
                        />
                    </svg>
                </div>

                {/* Spinning wheel SVG */}
                <svg
                    width="300"
                    height="300"
                    viewBox="0 0 300 300"
                    style={{
                        transform: `rotate(${cumulativeRotation}deg)`,
                        transition: spinning
                            ? `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)`
                            : "none",
                    }}
                    aria-label="Meal picker spin wheel"
                >
                    {n === 1 ? (
                        <circle cx={cx} cy={cy} r={r} fill={WHEEL_COLORS[0]} />
                    ) : (
                        segments.map((seg, i) => {
                            // Segments drawn from 12 o'clock (-90°) going clockwise
                            const startAngle = i * segAngle - 90;
                            const endAngle = (i + 1) * segAngle - 90;
                            const color = WHEEL_COLORS[i % WHEEL_COLORS.length];
                            return (
                                <path
                                    key={i}
                                    d={describeSegmentPath(cx, cy, r, startAngle, endAngle)}
                                    fill={color}
                                    stroke="rgba(0,0,0,0.15)"
                                    strokeWidth="1.5"
                                />
                            );
                        })
                    )}

                    {/* Segment labels */}
                    {segments.map((seg, i) => {
                        const midAngleDeg = (i + 0.5) * segAngle - 90;
                        const midAngleRad = (midAngleDeg * Math.PI) / 180;
                        const textR = n === 1 ? 0 : r * 0.62;
                        const tx = cx + textR * Math.cos(midAngleRad);
                        const ty = cy + textR * Math.sin(midAngleRad);
                        // Rotate text to read radially; flip left-half segments for readability
                        const normalizedMid = ((midAngleDeg % 360) + 360) % 360;
                        const needsFlip = normalizedMid > 90 && normalizedMid <= 270;
                        const labelAngle = needsFlip ? midAngleDeg + 180 : midAngleDeg;
                        const displayLabel = truncateLabel(seg.label);
                        return (
                            <text
                                key={i}
                                x={tx}
                                y={ty}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                transform={`rotate(${labelAngle}, ${tx}, ${ty})`}
                                style={{
                                    fontSize: n > 6 ? "8px" : "10px",
                                    fontWeight: 600,
                                    fill: "white",
                                    pointerEvents: "none",
                                    paintOrder: "stroke",
                                    stroke: "rgba(0,0,0,0.3)",
                                    strokeWidth: "3px",
                                }}
                            >
                                {displayLabel}
                            </text>
                        );
                    })}

                    {/* Center hub */}
                    <circle
                        cx={cx}
                        cy={cy}
                        r={18}
                        fill="var(--background)"
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth="2"
                    />
                    <circle cx={cx} cy={cy} r={8} fill={PRIMARY_COLOR} />
                </svg>
            </div>

            {/* Result display */}
            <div className="min-h-[48px] text-center">
                {winner && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <p className="text-xs text-muted-foreground mb-0.5">Today&apos;s pick 🎉</p>
                        <p className="text-xl font-bold text-foreground">{winner.label}</p>
                    </div>
                )}
            </div>

            {/* Spin button */}
            <Button
                onClick={handleSpin}
                disabled={spinning}
                className="gap-2 min-w-[120px]"
            >
                <Dices className="h-4 w-4" />
                {spinning ? "Spinning…" : "Spin!"}
            </Button>
        </div>
    );
}

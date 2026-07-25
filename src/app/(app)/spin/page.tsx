"use client";

import {useState, useRef} from "react";
import {useQuery} from "@tanstack/react-query";
import {getAllMeals} from "@/services/meal/queries";
import {MealPickerWheel, WheelSegment} from "@/components/meals/meal-picker-wheel";
import {Input} from "@/components/mantine/ui";
import {Button} from "@/components/mantine/ui";
import {Badge} from "@/components/mantine/ui";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/mantine/ui";
import {Dices, Plus, Search, Trash2, X} from "lucide-react";

const MAX_WHEEL_SEGMENTS = 10;

export default function SpinWheelPage() {
    const [segments, setSegments] = useState<WheelSegment[]>([]);
    const [manualInput, setManualInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const manualInputRef = useRef<HTMLInputElement>(null);

    const {data: pastMeals = [], isLoading: isLoadingMeals} = useQuery({
        queryKey: ["meals-for-wheel"],
        queryFn: getAllMeals,
    });

    // Deduplicated past meal titles
    const uniquePastMeals = Array.from(
        new Map(
            [...pastMeals]
                .sort((a, b) => a.title.localeCompare(b.title))
                .map((m) => [m.title.toLowerCase(), m.title]),
        ).values(),
    );

    const filteredPastMeals = searchQuery.trim()
        ? uniquePastMeals.filter((title) =>
            title.toLowerCase().includes(searchQuery.trim().toLowerCase()),
        )
        : uniquePastMeals;

    function addSegment(label: string) {
        const trimmed = label.trim();
        if (!trimmed) return;
        if (segments.length >= MAX_WHEEL_SEGMENTS) return;
        if (segments.some((s) => s.label.toLowerCase() === trimmed.toLowerCase())) return;
        setSegments((prev) => [...prev, {label: trimmed}]);
    }

    function removeSegment(index: number) {
        setSegments((prev) => prev.filter((_, i) => i !== index));
    }

    function handleManualAdd() {
        addSegment(manualInput);
        setManualInput("");
        manualInputRef.current?.focus();
    }

    function handleManualKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            e.preventDefault();
            handleManualAdd();
        }
    }

    const isSegmentAdded = (title: string) =>
        segments.some((s) => s.label.toLowerCase() === title.toLowerCase());

    const canAddMore = segments.length < MAX_WHEEL_SEGMENTS;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <header>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    <Dices className="h-3.5 w-3.5" />
                    Meal Picker
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Spin Wheel</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Build your wheel, then spin to decide what to eat.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Wheel */}
                <Card className="border-border/50 bg-card/60">
                    <CardContent className="p-6 flex flex-col items-center">
                        {segments.length === 0 ? (
                            <div className="py-16 text-center space-y-2">
                                <Dices className="h-12 w-12 mx-auto text-muted-foreground/40" />
                                <p className="text-sm text-muted-foreground">
                                    Add meals on the right to start spinning.
                                </p>
                            </div>
                        ) : (
                            <MealPickerWheel segments={segments} />
                        )}
                    </CardContent>
                </Card>

                {/* Controls */}
                <div className="space-y-4">
                    {/* Manual entry */}
                    <Card className="border-border/50 bg-card/60">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Plus className="h-4 w-4 text-primary" />
                                Add meal manually
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="flex gap-2">
                                <Input
                                    ref={manualInputRef}
                                    placeholder="e.g. Avocado Toast"
                                    value={manualInput}
                                    onChange={(e) => setManualInput(e.target.value)}
                                    onKeyDown={handleManualKeyDown}
                                    disabled={!canAddMore}
                                />
                                <Button
                                    onClick={handleManualAdd}
                                    disabled={!manualInput.trim() || !canAddMore}
                                    size="sm"
                                    className="shrink-0"
                                >
                                    Add
                                </Button>
                            </div>
                            {!canAddMore && (
                                <p className="mt-1.5 text-xs text-muted-foreground">
                                    Maximum {MAX_WHEEL_SEGMENTS} segments reached.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Past meals search */}
                    <Card className="border-border/50 bg-card/60">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Search className="h-4 w-4 text-primary" />
                                Search past meals
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-3">
                            <Input
                                placeholder="Search meals…"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                                {isLoadingMeals ? (
                                    <div className="flex items-center justify-center py-6">
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                    </div>
                                ) : filteredPastMeals.length === 0 ? (
                                    <p className="py-4 text-center text-xs text-muted-foreground">
                                        {searchQuery ? "No meals match your search." : "No past meals found."}
                                    </p>
                                ) : (
                                    filteredPastMeals.map((title) => {
                                        const added = isSegmentAdded(title);
                                        return (
                                            <div
                                                key={title}
                                                className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted/50 transition-colors"
                                            >
                                                <span className="text-sm truncate flex-1">{title}</span>
                                                <Button
                                                    variant={added ? "secondary" : "outline"}
                                                    size="sm"
                                                    className="h-6 text-xs px-2 shrink-0 ml-2"
                                                    onClick={() => {
                                                        if (added) {
                                                            const idx = segments.findIndex(
                                                                (s) => s.label.toLowerCase() === title.toLowerCase(),
                                                            );
                                                            if (idx !== -1) removeSegment(idx);
                                                        } else {
                                                            addSegment(title);
                                                        }
                                                    }}
                                                    disabled={!added && !canAddMore}
                                                >
                                                    {added ? "Remove" : "Add"}
                                                </Button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Current segments */}
                    {segments.length > 0 && (
                        <Card className="border-border/50 bg-card/60">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-semibold">
                                        Wheel segments
                                    </CardTitle>
                                    <Badge variant="secondary" className="text-xs">
                                        {segments.length} / {MAX_WHEEL_SEGMENTS}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="space-y-1">
                                    {segments.map((seg, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-2 rounded-md px-2 py-1.5 bg-muted/30"
                                        >
                                            <span className="flex-1 text-sm truncate">{seg.label}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                                                onClick={() => removeSegment(i)}
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-3 gap-1.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => setSegments([])}
                                >
                                    <Trash2 className="h-3 w-3" />
                                    Clear all
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

"use client";

import {useState} from "react";
import * as React from "react";
import {useQuery} from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/mantine/ui";
import {Button} from "@/components/mantine/ui";
import {Shuffle} from "lucide-react";
import {MealPickerWheel} from "@/components/meals/meal-picker-wheel";
import {getAllMeals} from "@/services/meal/queries";

const MAX_WHEEL_SEGMENTS = 10;

interface MealPickerDialogProps {
    trigger?: React.ReactElement;
}

export function MealPickerDialog({trigger}: MealPickerDialogProps) {
    const [open, setOpen] = useState(false);

    const {data: meals = [], isLoading} = useQuery({
        queryKey: ["meals-for-wheel"],
        queryFn: getAllMeals,
        enabled: open,
    });

    // Deduplicate meal titles so the wheel shows unique options
    const uniqueSegments = Array.from(
        new Map(meals.map((m) => [m.title.toLowerCase(), {label: m.title}])).values(),
    ).slice(0, MAX_WHEEL_SEGMENTS); // cap at MAX_WHEEL_SEGMENTS for readability

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button variant="outline" className="gap-2">
                        <Shuffle className="h-4 w-4" />
                        Spin for a Meal
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shuffle className="h-4 w-4 text-primary" />
                        Meal Picker
                    </DialogTitle>
                </DialogHeader>

                <div className="py-2">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        </div>
                    ) : uniqueSegments.length === 0 ? (
                        <div className="py-10 text-center text-sm text-muted-foreground">
                            <p>No meals found.</p>
                            <p className="mt-1">Log some meals first to use the picker!</p>
                        </div>
                    ) : (
                        <MealPickerWheel segments={uniqueSegments} />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

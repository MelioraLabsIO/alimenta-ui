"use client";

import {useState} from "react";
import {Select} from "@mantine/core";
import {Settings2} from "lucide-react";
import {Button, Card, CardContent, CardHeader, CardTitle, Text} from "@/components/mantine/ui";
import {toast} from "@/lib/notifications";
import {PreferenceTagInput} from "./preference-tag-input";
import type {FoodSearchItem} from "@/services/food/queries";

export function PreferencesSection() {
    const [units, setUnits] = useState("metric");
    const [goal, setGoal] = useState("maintain");
    const [dislikes, setDislikes] = useState<string[]>(["Mushrooms"]);
    const [allergies, setAllergies] = useState<string[]>(["Gluten", "Shellfish"]);
    const [selectedDislike, setSelectedDislike] = useState<FoodSearchItem | null>(null);
    const [selectedAllergy, setSelectedAllergy] = useState<FoodSearchItem | null>(null);

    function addItem(
        selectedFood: FoodSearchItem | null,
        items: string[],
        onUpdateItems: (items: string[]) => void,
        onResetSelection: () => void,
    ) {
        const item = selectedFood?.name.trim();

        if (item && !items.includes(item)) {
            onUpdateItems([...items, item]);
        }

        onResetSelection();
    }

    function removeItem(item: string, items: string[], onUpdateItems: (items: string[]) => void) {
        onUpdateItems(items.filter((currentItem) => currentItem !== item));
    }

    function handleSavePreferences() {
        toast.success("Preferences saved!");
    }

    return (
        <Card className="border-border/50 bg-card/60">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Settings2 className="h-4 w-4 text-muted-foreground" /> Preferences
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Text>Units</Text>
                        <Select
                            value={units}
                            onChange={(value) => value && setUnits(value)}
                            data={[
                                {value: "metric", label: "Metric (g, ml, kg)"},
                                {value: "imperial", label: "Imperial (oz, fl oz, lb)"},
                            ]}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Text>Goal</Text>
                        <Select
                            value={goal}
                            onChange={(value) => value && setGoal(value)}
                            data={[
                                {value: "cut", label: "Cut (lose weight)"},
                                {value: "maintain", label: "Maintain"},
                                {value: "bulk", label: "Bulk (gain muscle)"},
                            ]}
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <Text size="xl">Food Preferences</Text>
                    <div className="space-y-4">
                        <PreferenceTagInput
                            label="Dislikes"
                            placeholder="Search foods to add as a dislike"
                            items={dislikes}
                            selectedFood={selectedDislike}
                            onSelectedFoodChange={setSelectedDislike}
                            onAddItem={() =>
                                addItem(selectedDislike, dislikes, setDislikes, () => setSelectedDislike(null))
                            }
                            onRemoveItem={(item) => removeItem(item, dislikes, setDislikes)}
                        />
                        <PreferenceTagInput
                            label="Allergies"
                            placeholder="Search foods to add as an allergy"
                            items={allergies}
                            selectedFood={selectedAllergy}
                            onSelectedFoodChange={setSelectedAllergy}
                            onAddItem={() =>
                                addItem(selectedAllergy, allergies, setAllergies, () => setSelectedAllergy(null))
                            }
                            onRemoveItem={(item) => removeItem(item, allergies, setAllergies)}
                        />
                    </div>
                </div>

                <Button size="sm" onClick={handleSavePreferences}>
                    Save preferences
                </Button>
            </CardContent>
        </Card>
    );
}

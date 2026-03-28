"use client";

import {useState, useEffect} from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Utensils, Sparkles} from "lucide-react";
import {ManualForm} from "@/app/(app)/log/ManualForm";
import {NaturalLanguageForm} from "@/app/(app)/log/NaturalLanguageForm";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {useQueryClient} from "@tanstack/react-query";
import {Meal} from "@/core/types";

interface LogMealDialogProps {
    mealToEdit?: Meal | null;
    onOpenChange?: (open: boolean) => void;
}

export function LogMealDialog({mealToEdit, onOpenChange}: LogMealDialogProps) {
    const [open, setOpen] = useState(false);

    const queryClient = useQueryClient();

    // Open the dialog when mealToEdit is provided
    useEffect(() => {
        if (mealToEdit) {
            setOpen(true);
        }
    }, [mealToEdit]);

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        onOpenChange?.(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            {!mealToEdit && (
                <DialogTrigger asChild>
                    <Button className="gap-2">
                        <Utensils className="h-4 w-4"/> Log Meal
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle>{mealToEdit ? "Edit Meal" : "Log Meal"}</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-hidden flex flex-col p-6 pt-2">
                    <Tabs defaultValue="manual" className="flex-1 flex flex-col overflow-hidden">
                        <TabsList className="w-full sm:w-auto shrink-0">
                            <TabsTrigger value="manual" className="flex-1 sm:flex-none">
                                Manual
                            </TabsTrigger>
                            {!mealToEdit && (
                                <TabsTrigger value="natural" className="flex-1 sm:flex-none">
                                    Natural Language
                                </TabsTrigger>
                            )}
                        </TabsList>

                        <div className="flex-1 mt-4 overflow-y-auto pr-2">
                            <TabsContent value="manual" className="mt-0 pb-4">
                                <ManualForm
                                    prefill={mealToEdit || undefined}
                                    onSuccess={() => {
                                        handleOpenChange(false);
                                        queryClient.invalidateQueries({queryKey: ["meals"]});
                                    }}
                                />
                            </TabsContent>

                            <TabsContent value="natural" className="mt-0 pb-4">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-sm font-semibold">
                                        <Sparkles className="h-4 w-4 text-emerald-400"/>
                                        AI-Powered Parsing
                                    </div>
                                    <NaturalLanguageForm onSuccess={() => {
                                        handleOpenChange(false);
                                        queryClient.invalidateQueries({queryKey: ["meals"]});
                                    }}/>
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}

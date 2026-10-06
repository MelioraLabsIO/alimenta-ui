"use client";

import { useState, useEffect, type ReactNode } from "react";
import {
    Button,
    Group,
    Modal,
    Stack,
    Tabs,
    Text,
    ThemeIcon,
} from "@mantine/core";
import { Pencil, Plus, Sparkles } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Meal } from "@/core/types/models/meal";
import { ManualForm } from "@/app/(authenticated)/log/ManualForm/ManualForm";
import { NaturalLanguageForm } from "@/app/(authenticated)/log/NaturalLanguageForm/NaturalLanguageForm";

interface LogMealDialogProps {
    mealToEdit?: Meal | null;
    onOpenChange?: (open: boolean) => void;
    /**
     * Custom opener rendered in place of the default "Log meal" button.
     * Receives a function that opens the dialog. Ignored while editing.
     */
    renderTrigger?: (open: () => void) => ReactNode;
}

export function LogMealDialog({
    mealToEdit,
    onOpenChange,
    renderTrigger,
}: LogMealDialogProps) {
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

    const openDialog = () => handleOpenChange(true);

    return (
        <>
            {!mealToEdit &&
                (renderTrigger ? (
                    renderTrigger(openDialog)
                ) : (
                    <Button
                        leftSection={<Plus size={16} />}
                        onClick={openDialog}
                    >
                        Log meal
                    </Button>
                ))}
            <Modal
                opened={open}
                onClose={() => handleOpenChange(false)}
                title={mealToEdit ? "Edit meal" : "Log meal"}
                size={680}
            >
                <Tabs defaultValue="manual">
                    <Tabs.List>
                        <Tabs.Tab
                            value="manual"
                            leftSection={<Pencil size={15} />}
                        >
                            Manual
                        </Tabs.Tab>
                        {!mealToEdit && (
                            <Tabs.Tab
                                value="natural"
                                leftSection={<Sparkles size={15} />}
                            >
                                Natural language
                            </Tabs.Tab>
                        )}
                    </Tabs.List>

                    <Tabs.Panel value="manual" pt={18}>
                        <ManualForm
                            prefill={mealToEdit || undefined}
                            onSuccess={() => {
                                handleOpenChange(false);
                                queryClient.invalidateQueries({
                                    queryKey: ["meals"],
                                });
                            }}
                        />
                    </Tabs.Panel>

                    <Tabs.Panel value="natural" pt={18}>
                        <Stack gap={16}>
                            <Group gap={8} wrap="nowrap">
                                <ThemeIcon size={28} radius={9}>
                                    <Sparkles size={14} />
                                </ThemeIcon>
                                <Text fz={14} fw={600}>
                                    AI-powered parsing
                                </Text>
                            </Group>
                            <NaturalLanguageForm
                                onSuccess={() => {
                                    handleOpenChange(false);
                                    queryClient.invalidateQueries({
                                        queryKey: ["meals"],
                                    });
                                }}
                            />
                        </Stack>
                    </Tabs.Panel>
                </Tabs>
            </Modal>
        </>
    );
}

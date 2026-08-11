import { z } from "zod";

export const joinSpinSessionSchema = z.object({
    displayName: z.string().trim().min(1, "Please enter your name"),
});

export type JoinSpinSessionInput = z.input<typeof joinSpinSessionSchema>;
export type JoinSpinSessionSchema = z.output<typeof joinSpinSessionSchema>;

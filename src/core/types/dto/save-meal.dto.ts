import {EMealType, EMealUnit} from "../models/meal";

export type SaveMealDTO = {
    title: string;
    mealTime: Date;
    type: EMealType;
    items: SaveMealItemDTO[];
    mood?: number;
    energy?: number;
    digestion?: number;
    likeness?: number;
    notes?: string;
};

export type SaveMealItemDTO = {
    foodSource: string; // e.g., "custom", "catalog"
    foodSourceId: string;
    quantity: number;
    unit: EMealUnit; // e.g., "g", "ml", "cup", "oz", etc.
};

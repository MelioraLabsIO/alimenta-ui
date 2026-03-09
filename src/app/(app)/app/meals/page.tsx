// src/app/meals/page.tsx
import { getAllMealsService } from "@/services/meals/get-meal-entries";

export default async function MealsPage() {
    const meals = await getAllMealsService();
    console.log("meals: ", meals)
    return <div><h1>Hello</h1></div>;
}
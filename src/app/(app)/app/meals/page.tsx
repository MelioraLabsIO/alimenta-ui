// src/app/meals/page.tsx
import {mealsClient} from "@/services/meals/mealsClient";

export default async function MealsPage() {
    const meals = await mealsClient.getAllMeals();
    console.log("meals: ", meals)
    return <div><h1>Hello</h1></div>;
}
// src/app/meals/page.tsx

import {getMeals} from "@/apiClient/meals";

export const dynamic = "force-dynamic";

export default async function MealsPage() {
    const meals = await getMeals()

    console.log("meals:", meals)
    return <div><h1>Hello</h1></div>;
}
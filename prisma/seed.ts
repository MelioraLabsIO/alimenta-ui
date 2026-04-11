import {PrismaClient, MealType} from "../src/generated/prisma/client.js";
import {PrismaPg} from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config({path: ".env.local"});

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

function daysAgo(n: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
}

async function main() {
    console.log("Starting seeding...");

    // 1. Seed Catalog Foods
    const catalogFoodsData = [
        // Proteins
        { name: "Apple",            calories: 52,  protein: 0.3,  carbs: 14,   fat: 0.2  },
        { name: "Chicken Breast",   calories: 165, protein: 31,   carbs: 0,    fat: 3.6  },
        { name: "Brown Rice",       calories: 111, protein: 2.6,  carbs: 23,   fat: 0.9  },
        { name: "Broccoli",         calories: 34,  protein: 2.8,  carbs: 7,    fat: 0.4  },
        { name: "Egg",              calories: 155, protein: 13,   carbs: 1.1,  fat: 11   },
        { name: "Salmon",           calories: 208, protein: 20,   carbs: 0,    fat: 13   },
        { name: "Greek Yogurt",     calories: 59,  protein: 10,   carbs: 3.6,  fat: 0.4  },
        { name: "Oats",             calories: 389, protein: 17,   carbs: 66,   fat: 7    },
        { name: "Banana",           calories: 89,  protein: 1.1,  carbs: 23,   fat: 0.3  },
        { name: "Almonds",          calories: 579, protein: 21,   carbs: 22,   fat: 50   },
        { name: "Sweet Potato",     calories: 86,  protein: 1.6,  carbs: 20,   fat: 0.1  },
        { name: "Spinach",          calories: 23,  protein: 2.9,  carbs: 3.6,  fat: 0.4  },
        { name: "Avocado",          calories: 160, protein: 2,    carbs: 9,    fat: 15   },
        { name: "Whole Milk",       calories: 61,  protein: 3.2,  carbs: 4.8,  fat: 3.3  },
        { name: "Cheddar Cheese",   calories: 403, protein: 25,   carbs: 1.3,  fat: 33   },
        { name: "Tuna (canned)",    calories: 116, protein: 26,   carbs: 0,    fat: 1    },
        { name: "Lentils",          calories: 116, protein: 9,    carbs: 20,   fat: 0.4  },
        { name: "Quinoa",           calories: 120, protein: 4.4,  carbs: 22,   fat: 1.9  },
        { name: "Blueberries",      calories: 57,  protein: 0.7,  carbs: 14,   fat: 0.3  },
        { name: "Peanut Butter",    calories: 588, protein: 25,   carbs: 20,   fat: 50   },
        { name: "White Rice",       calories: 130, protein: 2.7,  carbs: 28,   fat: 0.3  },
        { name: "Pasta",            calories: 131, protein: 5,    carbs: 25,   fat: 1.1  },
        { name: "Tomato",           calories: 18,  protein: 0.9,  carbs: 3.9,  fat: 0.2  },
        { name: "Olive Oil",        calories: 884, protein: 0,    carbs: 0,    fat: 100  },
        { name: "Orange",           calories: 47,  protein: 0.9,  carbs: 12,   fat: 0.1  },
        { name: "Ground Beef (lean)", calories: 215, protein: 26, carbs: 0,    fat: 12   },
        { name: "Cottage Cheese",   calories: 98,  protein: 11,   carbs: 3.4,  fat: 4.3  },
        { name: "Whole Wheat Bread",calories: 247, protein: 13,   carbs: 41,   fat: 3.4  },
        { name: "Strawberries",     calories: 32,  protein: 0.7,  carbs: 7.7,  fat: 0.3  },
        { name: "Black Beans",      calories: 132, protein: 8.9,  carbs: 24,   fat: 0.5  },
    ];

    console.log("Seeding catalog foods...");
    const createdCatalogFoods = [];
    for (const food of catalogFoodsData) {
        const created = await prisma.catalogFood.create({ data: food });
        createdCatalogFoods.push(created);
    }

    // Helper: index by name
    const food = Object.fromEntries(createdCatalogFoods.map(f => [f.name, f]));

    // 2. Seed a Profile (Example User)
    const profileId = "83d35d0e-fe6e-408a-9b05-22effbd06263";
    console.log(`Seeding profile for ID: ${profileId}...`);

    const profile = await prisma.profile.upsert({
        where: { id: profileId },
        update: {},
        create: {
            id: profileId,
            firstName: "Eric",
            lastName: "Hernandez",
            email: "eric@melioralabs.io",
            username: "eric",
            preferences: {
                create: {
                    units: "metric",
                    goal: "maintenance",
                }
            }
        },
    });

    // 3. Seed Meals — spread across the last 30 days
    console.log("Seeding meals...");

    const mealsData = [
        // --- 30 days ago ---
        {
            title: "Oatmeal with Berries",
            type: MealType.BREAKFAST, mood: 4, energy: 4, digestion: 5,
            foodTime: daysAgo(30),
            items: [

                { name: "Oats",         quantity: 80,  unit: "g" },
                { name: "Blueberries",  quantity: 100, unit: "g" },
                { name: "Whole Milk",   quantity: 200, unit: "ml" },
            ],
        },
        {
            title: "Grilled Chicken & Rice",
            type: MealType.LUNCH, mood: 5, energy: 5, digestion: 4,
            foodTime: daysAgo(30),
            items: [
                { name: "Chicken Breast", quantity: 180, unit: "g" },
                { name: "Brown Rice",     quantity: 200, unit: "g" },
                { name: "Broccoli",       quantity: 120, unit: "g" },
            ],
        },
        {
            title: "Salmon with Sweet Potato",
            type: MealType.DINNER, mood: 5, energy: 4, digestion: 5,
            foodTime: daysAgo(30),
            items: [
                { name: "Salmon",        quantity: 200, unit: "g" },
                { name: "Sweet Potato",  quantity: 150, unit: "g" },
                { name: "Spinach",       quantity: 80,  unit: "g" },
            ],
        },

        // --- 27 days ago ---
        {
            title: "Scrambled Eggs & Toast",
            type: MealType.BREAKFAST, mood: 3, energy: 3, digestion: 4,
            foodTime: daysAgo(27),
            items: [
                { name: "Egg",                quantity: 3,   unit: "piece" },
                { name: "Whole Wheat Bread",  quantity: 60,  unit: "g" },
                { name: "Avocado",            quantity: 50,  unit: "g" },
            ],
        },
        {
            title: "Tuna Pasta",
            type: MealType.LUNCH, mood: 4, energy: 4, digestion: 3,
            foodTime: daysAgo(27),
            items: [
                { name: "Pasta",         quantity: 200, unit: "g" },
                { name: "Tuna (canned)", quantity: 120, unit: "g" },
                { name: "Tomato",        quantity: 100, unit: "g" },
                { name: "Olive Oil",     quantity: 10,  unit: "ml" },
            ],
        },
        {
            title: "Afternoon Apple",
            type: MealType.SNACK, mood: 4, energy: 3, digestion: 5,
            foodTime: daysAgo(27),
            items: [
                { name: "Apple",         quantity: 1,   unit: "piece" },
                { name: "Peanut Butter", quantity: 30,  unit: "g" },
            ],
        },
        {
            title: "Beef & Quinoa Bowl",
            type: MealType.DINNER, mood: 4, energy: 4, digestion: 4,
            foodTime: daysAgo(27),
            items: [
                { name: "Ground Beef (lean)", quantity: 150, unit: "g" },
                { name: "Quinoa",             quantity: 180, unit: "g" },
                { name: "Spinach",            quantity: 60,  unit: "g" },
                { name: "Tomato",             quantity: 80,  unit: "g" },
            ],
        },

        // --- 24 days ago ---
        {
            title: "Greek Yogurt Parfait",
            type: MealType.BREAKFAST, mood: 5, energy: 5, digestion: 5,
            foodTime: daysAgo(24),
            items: [
                { name: "Greek Yogurt",  quantity: 200, unit: "g" },
                { name: "Blueberries",   quantity: 80,  unit: "g" },
                { name: "Almonds",       quantity: 20,  unit: "g" },
            ],
        },
        {
            title: "Lentil Soup",
            type: MealType.LUNCH, mood: 4, energy: 3, digestion: 4,
            foodTime: daysAgo(24),
            items: [
                { name: "Lentils",   quantity: 200, unit: "g" },
                { name: "Tomato",    quantity: 100, unit: "g" },
                { name: "Spinach",   quantity: 50,  unit: "g" },
                { name: "Olive Oil", quantity: 10,  unit: "ml" },
            ],
        },
        {
            title: "Cheese & Crackers",
            type: MealType.SNACK, mood: 3, energy: 3, digestion: 3,
            foodTime: daysAgo(24),
            items: [
                { name: "Cheddar Cheese",    quantity: 40,  unit: "g" },
                { name: "Whole Wheat Bread", quantity: 40,  unit: "g" },
            ],
        },

        // --- 21 days ago ---
        {
            title: "Banana Oat Smoothie",
            type: MealType.BREAKFAST, mood: 4, energy: 4, digestion: 5,
            foodTime: daysAgo(21),
            items: [
                { name: "Banana",       quantity: 1,   unit: "piece" },
                { name: "Oats",         quantity: 50,  unit: "g" },
                { name: "Whole Milk",   quantity: 250, unit: "ml" },
                { name: "Peanut Butter",quantity: 20,  unit: "g" },
            ],
        },
        {
            title: "Chicken & Avocado Wrap",
            type: MealType.LUNCH, mood: 5, energy: 5, digestion: 4,
            foodTime: daysAgo(21),
            items: [
                { name: "Chicken Breast",    quantity: 150, unit: "g" },
                { name: "Avocado",           quantity: 80,  unit: "g" },
                { name: "Whole Wheat Bread", quantity: 80,  unit: "g" },
                { name: "Tomato",            quantity: 60,  unit: "g" },
            ],
        },
        {
            title: "Salmon & White Rice",
            type: MealType.DINNER, mood: 5, energy: 4, digestion: 5,
            foodTime: daysAgo(21),
            items: [
                { name: "Salmon",      quantity: 180, unit: "g" },
                { name: "White Rice",  quantity: 200, unit: "g" },
                { name: "Broccoli",    quantity: 100, unit: "g" },
            ],
        },

        // --- 18 days ago ---
        {
            title: "Eggs & Avocado Toast",
            type: MealType.BREAKFAST, mood: 5, energy: 5, digestion: 5,
            foodTime: daysAgo(18),
            items: [
                { name: "Egg",               quantity: 2,   unit: "piece" },
                { name: "Avocado",           quantity: 100, unit: "g" },
                { name: "Whole Wheat Bread", quantity: 80,  unit: "g" },
            ],
        },
        {
            title: "Black Bean Bowl",
            type: MealType.LUNCH, mood: 4, energy: 4, digestion: 4,
            foodTime: daysAgo(18),
            items: [
                { name: "Black Beans",   quantity: 200, unit: "g" },
                { name: "White Rice",    quantity: 150, unit: "g" },
                { name: "Tomato",        quantity: 80,  unit: "g" },
                { name: "Avocado",       quantity: 60,  unit: "g" },
            ],
        },
        {
            title: "Strawberry Yogurt",
            type: MealType.SNACK, mood: 4, energy: 3, digestion: 5,
            foodTime: daysAgo(18),
            items: [
                { name: "Greek Yogurt",  quantity: 150, unit: "g" },
                { name: "Strawberries",  quantity: 100, unit: "g" },
            ],
        },
        {
            title: "Beef Stir Fry",
            type: MealType.DINNER, mood: 4, energy: 4, digestion: 3,
            foodTime: daysAgo(18),
            items: [
                { name: "Ground Beef (lean)", quantity: 180, unit: "g" },
                { name: "Broccoli",           quantity: 120, unit: "g" },
                { name: "Brown Rice",         quantity: 180, unit: "g" },
                { name: "Olive Oil",          quantity: 10,  unit: "ml" },
            ],
        },

        // --- 14 days ago ---
        {
            title: "Cottage Cheese & Fruit",
            type: MealType.BREAKFAST, mood: 3, energy: 3, digestion: 4,
            foodTime: daysAgo(14),
            items: [
                { name: "Cottage Cheese", quantity: 200, unit: "g" },
                { name: "Strawberries",   quantity: 100, unit: "g" },
                { name: "Blueberries",    quantity: 60,  unit: "g" },
            ],
        },
        {
            title: "Quinoa Salad",
            type: MealType.LUNCH, mood: 4, energy: 4, digestion: 5,
            foodTime: daysAgo(14),
            items: [
                { name: "Quinoa",    quantity: 200, unit: "g" },
                { name: "Spinach",   quantity: 80,  unit: "g" },
                { name: "Tomato",    quantity: 100, unit: "g" },
                { name: "Avocado",   quantity: 80,  unit: "g" },
                { name: "Olive Oil", quantity: 10,  unit: "ml" },
            ],
        },
        {
            title: "Almond Snack",
            type: MealType.SNACK, mood: 4, energy: 4, digestion: 5,
            foodTime: daysAgo(14),
            items: [
                { name: "Almonds", quantity: 30, unit: "g" },
                { name: "Orange",  quantity: 1,  unit: "piece" },
            ],
        },
        {
            title: "Tuna & Sweet Potato",
            type: MealType.DINNER, mood: 5, energy: 5, digestion: 5,
            foodTime: daysAgo(14),
            items: [
                { name: "Tuna (canned)", quantity: 150, unit: "g" },
                { name: "Sweet Potato",  quantity: 200, unit: "g" },
                { name: "Spinach",       quantity: 80,  unit: "g" },
            ],
        },

        // --- 10 days ago ---
        {
            title: "Peanut Butter Oats",
            type: MealType.BREAKFAST, mood: 4, energy: 5, digestion: 4,
            foodTime: daysAgo(10),
            items: [
                { name: "Oats",          quantity: 90,  unit: "g" },
                { name: "Peanut Butter", quantity: 30,  unit: "g" },
                { name: "Banana",        quantity: 1,   unit: "piece" },
                { name: "Whole Milk",    quantity: 200, unit: "ml" },
            ],
        },
        {
            title: "Chicken & Lentil Soup",
            type: MealType.LUNCH, mood: 4, energy: 4, digestion: 4,
            foodTime: daysAgo(10),
            items: [
                { name: "Chicken Breast", quantity: 150, unit: "g" },
                { name: "Lentils",        quantity: 150, unit: "g" },
                { name: "Tomato",         quantity: 100, unit: "g" },
                { name: "Spinach",        quantity: 60,  unit: "g" },
            ],
        },
        {
            title: "Cheese Toast",
            type: MealType.SNACK, mood: 3, energy: 3, digestion: 3,
            foodTime: daysAgo(10),
            items: [
                { name: "Whole Wheat Bread", quantity: 60,  unit: "g" },
                { name: "Cheddar Cheese",    quantity: 30,  unit: "g" },
            ],
        },
        {
            title: "Pasta Bolognese",
            type: MealType.DINNER, mood: 5, energy: 4, digestion: 3,
            foodTime: daysAgo(10),
            items: [
                { name: "Pasta",              quantity: 200, unit: "g" },
                { name: "Ground Beef (lean)", quantity: 150, unit: "g" },
                { name: "Tomato",             quantity: 150, unit: "g" },
                { name: "Olive Oil",          quantity: 10,  unit: "ml" },
            ],
        },

        // --- 7 days ago ---
        {
            title: "Egg & Spinach Omelette",
            type: MealType.BREAKFAST, mood: 5, energy: 5, digestion: 5,
            foodTime: daysAgo(7),
            items: [
                { name: "Egg",     quantity: 3,  unit: "piece" },
                { name: "Spinach", quantity: 60, unit: "g" },
                { name: "Tomato",  quantity: 60, unit: "g" },
            ],
        },
        {
            title: "Salmon Quinoa Bowl",
            type: MealType.LUNCH, mood: 5, energy: 5, digestion: 5,
            foodTime: daysAgo(7),
            items: [
                { name: "Salmon",    quantity: 180, unit: "g" },
                { name: "Quinoa",    quantity: 180, unit: "g" },
                { name: "Avocado",   quantity: 80,  unit: "g" },
                { name: "Spinach",   quantity: 60,  unit: "g" },
            ],
        },
        {
            title: "Banana & Almonds",
            type: MealType.SNACK, mood: 4, energy: 4, digestion: 5,
            foodTime: daysAgo(7),
            items: [
                { name: "Banana",  quantity: 1,  unit: "piece" },
                { name: "Almonds", quantity: 25, unit: "g" },
            ],
        },
        {
            title: "Chicken Sweet Potato Bake",
            type: MealType.DINNER, mood: 5, energy: 5, digestion: 4,
            foodTime: daysAgo(7),
            items: [
                { name: "Chicken Breast", quantity: 200, unit: "g" },
                { name: "Sweet Potato",   quantity: 200, unit: "g" },
                { name: "Broccoli",       quantity: 120, unit: "g" },
                { name: "Olive Oil",      quantity: 10,  unit: "ml" },
            ],
        },

        // --- 4 days ago ---
        {
            title: "Yogurt & Strawberries",
            type: MealType.BREAKFAST, mood: 4, energy: 4, digestion: 5,
            foodTime: daysAgo(4),
            items: [
                { name: "Greek Yogurt",  quantity: 200, unit: "g" },
                { name: "Strawberries",  quantity: 120, unit: "g" },
                { name: "Almonds",       quantity: 20,  unit: "g" },
            ],
        },
        {
            title: "Black Bean & Rice",
            type: MealType.LUNCH, mood: 4, energy: 4, digestion: 4,
            foodTime: daysAgo(4),
            items: [
                { name: "Black Beans",  quantity: 180, unit: "g" },
                { name: "Brown Rice",   quantity: 180, unit: "g" },
                { name: "Avocado",      quantity: 80,  unit: "g" },
                { name: "Tomato",       quantity: 80,  unit: "g" },
            ],
        },
        {
            title: "Cottage Cheese Snack",
            type: MealType.SNACK, mood: 3, energy: 3, digestion: 4,
            foodTime: daysAgo(4),
            items: [
                { name: "Cottage Cheese", quantity: 150, unit: "g" },
                { name: "Blueberries",    quantity: 80,  unit: "g" },
            ],
        },
        {
            title: "Beef & Broccoli",
            type: MealType.DINNER, mood: 4, energy: 4, digestion: 4,
            foodTime: daysAgo(4),
            items: [
                { name: "Ground Beef (lean)", quantity: 180, unit: "g" },
                { name: "Broccoli",           quantity: 150, unit: "g" },
                { name: "White Rice",         quantity: 200, unit: "g" },
                { name: "Olive Oil",          quantity: 10,  unit: "ml" },
            ],
        },

        // --- 2 days ago ---
        {
            title: "Oats & Banana",
            type: MealType.BREAKFAST, mood: 4, energy: 4, digestion: 5,
            foodTime: daysAgo(2),
            items: [
                { name: "Oats",       quantity: 80,  unit: "g" },
                { name: "Banana",     quantity: 1,   unit: "piece" },
                { name: "Whole Milk", quantity: 200, unit: "ml" },
            ],
        },
        {
            title: "Tuna Salad",
            type: MealType.LUNCH, mood: 4, energy: 4, digestion: 5,
            foodTime: daysAgo(2),
            items: [
                { name: "Tuna (canned)", quantity: 150, unit: "g" },
                { name: "Spinach",       quantity: 100, unit: "g" },
                { name: "Tomato",        quantity: 100, unit: "g" },
                { name: "Avocado",       quantity: 80,  unit: "g" },
                { name: "Olive Oil",     quantity: 10,  unit: "ml" },
            ],
        },
        {
            title: "Orange & Peanut Butter",
            type: MealType.SNACK, mood: 4, energy: 3, digestion: 5,
            foodTime: daysAgo(2),
            items: [
                { name: "Orange",        quantity: 1,  unit: "piece" },
                { name: "Peanut Butter", quantity: 25, unit: "g" },
            ],
        },
        {
            title: "Lentil & Chicken Stew",
            type: MealType.DINNER, mood: 5, energy: 5, digestion: 4,
            foodTime: daysAgo(2),
            items: [
                { name: "Lentils",        quantity: 200, unit: "g" },
                { name: "Chicken Breast", quantity: 150, unit: "g" },
                { name: "Tomato",         quantity: 120, unit: "g" },
                { name: "Spinach",        quantity: 60,  unit: "g" },
                { name: "Olive Oil",      quantity: 10,  unit: "ml" },
            ],
        },

        // --- Today ---
        {
            title: "Scrambled Eggs & Avocado",
            type: MealType.BREAKFAST, mood: 5, energy: 5, digestion: 5,
            foodTime: daysAgo(0),
            items: [
                { name: "Egg",     quantity: 3,   unit: "piece" },
                { name: "Avocado", quantity: 100, unit: "g" },
                { name: "Tomato",  quantity: 80,  unit: "g" },
            ],
        },
        {
            title: "Healthy Lunch",
            type: MealType.LUNCH, mood: 4, energy: 4, digestion: 5,
            foodTime: daysAgo(0),
            items: [
                { name: "Chicken Breast", quantity: 150, unit: "g" },
                { name: "Brown Rice",     quantity: 200, unit: "g" },
                { name: "Broccoli",       quantity: 100, unit: "g" },
            ],
        },
        {
            title: "Quick Snack",
            type: MealType.SNACK, mood: 5, energy: 3, digestion: 5,
            foodTime: daysAgo(0),
            items: [
                { name: "Apple",         quantity: 1,  unit: "piece" },
                { name: "Almonds",       quantity: 20, unit: "g" },
            ],
        },
    ];

    for (const mealData of mealsData) {
        await prisma.meal.create({
            data: {
                title: mealData.title,
                type: mealData.type,
                mood: mealData.mood,
                energy: mealData.energy,
                digestion: mealData.digestion,
                foodTime: mealData.foodTime,
                userId: profile.id,
                items: {
                    create: mealData.items.map(item => ({
                        catalogFoodId: food[item.name].id,
                        quantity: item.quantity,
                        unit: item.unit,
                    })),
                },
            },
        });
    }

    console.log(`Seeded ${mealsData.length} meals across the last 30 days.`);
    console.log("Seeding completed successfully.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    })
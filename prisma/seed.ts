import {PrismaClient} from "../src/generated/prisma/client.js";
import {PrismaPg} from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config({path: ".env.local"});

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Starting seeding...");

    // 1. Seed Catalog Foods
    const catalogFoods = [
        {
            name: "Apple",
            calories: 52,
            protein: 0.3,
            carbs: 14,
            fat: 0.2,
        },
        {
            name: "Chicken Breast",
            calories: 165,
            protein: 31,
            carbs: 0,
            fat: 3.6,
        },
        {
            name: "Brown Rice",
            calories: 111,
            protein: 2.6,
            carbs: 23,
            fat: 0.9,
        },
        {
            name: "Broccoli",
            calories: 34,
            protein: 2.8,
            carbs: 7,
            fat: 0.4,
        },
        {
            name: "Egg",
            calories: 155,
            protein: 13,
            carbs: 1.1,
            fat: 11,
        },
    ];

    console.log("Seeding catalog foods...");
    const createdCatalogFoods = [];
    for (const food of catalogFoods) {
        const created = await prisma.catalogFood.create({
            data: food,
        });
        createdCatalogFoods.push(created);
    }

    // 2. Seed a Profile (Example User)
    // Note: In a real app, this might come from Supabase Auth,
    // but for the database we need a Profile record.
    const profileId = "83d35d0e-fe6e-408a-9b05-22effbd06263"; // Mock UUID
    console.log(`Seeding profile for ID: ${profileId}...`);

    const profile = await prisma.profile.upsert({
        where: {id: profileId},
        update: {},
        create: {
            id: profileId,
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            username: "johndoe",
            preferences: {
                create: {
                    units: "metric",
                    goal: "maintenance",
                }
            }
        },
    });

    // 3. Seed Meals
    console.log("Seeding meals...");
    const meal1 = await prisma.meal.create({
        data: {
            title: "Healthy Lunch",
            type: "LUNCH",
            mood: 4,
            energy: 4,
            digestion: 5,
            foodTime: new Date(),
            userId: profile.id,
            items: {
                create: [
                    {
                        catalogFoodId: createdCatalogFoods[1].id, // Chicken
                        quantity: 150,
                        unit: "g",
                    },
                    {
                        catalogFoodId: createdCatalogFoods[2].id, // Rice
                        quantity: 200,
                        unit: "g",
                    },
                    {
                        catalogFoodId: createdCatalogFoods[3].id, // Broccoli
                        quantity: 100,
                        unit: "g",
                    }
                ]
            }
        }
    });

    const meal2 = await prisma.meal.create({
        data: {
            title: "Quick Snack",
            type: "SNACK",
            mood: 5,
            energy: 3,
            digestion: 5,
            foodTime: new Date(),
            userId: profile.id,
            items: {
                create: [
                    {
                        catalogFoodId: createdCatalogFoods[0].id, // Apple
                        quantity: 1,
                        unit: "piece",
                    }
                ]
            }
        }
    });

    console.log("Seeding completed successfully.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

-- DropForeignKey
ALTER TABLE "meal_items" DROP CONSTRAINT "meal_items_mealId_fkey";

-- AddForeignKey
ALTER TABLE "meal_items" ADD CONSTRAINT "meal_items_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "meals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

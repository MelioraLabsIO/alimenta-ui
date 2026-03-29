/*
  Warnings:

  - You are about to drop the column `food_timee` on the `meals` table. All the data in the column will be lost.
  - Added the required column `food_time` to the `meals` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "meal_items" DROP CONSTRAINT "meal_items_mealId_fkey";

-- AlterTable
ALTER TABLE "meals" DROP COLUMN "food_timee",
ADD COLUMN     "food_time" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "meal_items" ADD CONSTRAINT "meal_items_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "meals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

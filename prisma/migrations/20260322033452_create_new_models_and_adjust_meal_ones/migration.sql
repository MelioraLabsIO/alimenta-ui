/*
  Warnings:

  - The values [MEAL] on the enum `MealType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `foods` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `meals` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RestrictionType" AS ENUM ('DISLIKE', 'ALLERGY');

-- AlterEnum
BEGIN;
CREATE TYPE "MealType_new" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'OTHER');
ALTER TABLE "meals" ALTER COLUMN "type" TYPE "MealType_new" USING ("type"::text::"MealType_new");
ALTER TYPE "MealType" RENAME TO "MealType_old";
ALTER TYPE "MealType_new" RENAME TO "MealType";
DROP TYPE "public"."MealType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "foods" DROP CONSTRAINT "foods_food_id_fkey";

-- AlterTable
ALTER TABLE "meals" ADD COLUMN     "userId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "avatar" TEXT;

-- DropTable
DROP TABLE "foods";

-- CreateTable
CREATE TABLE "catalog_foods" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "calories" DECIMAL(65,30),
    "protein" DECIMAL(65,30),
    "carbs" DECIMAL(65,30),
    "fat" DECIMAL(65,30),

    CONSTRAINT "catalog_foods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_items" (
    "id" TEXT NOT NULL,
    "mealId" TEXT NOT NULL,
    "catalogFoodId" TEXT NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "unit" TEXT NOT NULL,

    CONSTRAINT "meal_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preference_restrictions" (
    "id" TEXT NOT NULL,
    "type" "RestrictionType" NOT NULL,
    "preferencesId" TEXT NOT NULL,
    "catalogFoodId" TEXT NOT NULL,

    CONSTRAINT "preference_restrictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preferences" (
    "id" TEXT NOT NULL,
    "profileId" UUID NOT NULL,
    "units" TEXT NOT NULL,
    "goal" TEXT NOT NULL,

    CONSTRAINT "preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "meal_items_mealId_catalogFoodId_key" ON "meal_items"("mealId", "catalogFoodId");

-- CreateIndex
CREATE UNIQUE INDEX "preference_restrictions_preferencesId_catalogFoodId_type_key" ON "preference_restrictions"("preferencesId", "catalogFoodId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "preferences_profileId_key" ON "preferences"("profileId");

-- CreateIndex
CREATE INDEX "preferences_profileId_idx" ON "preferences"("profileId");

-- AddForeignKey
ALTER TABLE "meals" ADD CONSTRAINT "meals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_items" ADD CONSTRAINT "meal_items_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "meals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_items" ADD CONSTRAINT "meal_items_catalogFoodId_fkey" FOREIGN KEY ("catalogFoodId") REFERENCES "catalog_foods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preference_restrictions" ADD CONSTRAINT "preference_restrictions_preferencesId_fkey" FOREIGN KEY ("preferencesId") REFERENCES "preferences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preference_restrictions" ADD CONSTRAINT "preference_restrictions_catalogFoodId_fkey" FOREIGN KEY ("catalogFoodId") REFERENCES "catalog_foods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preferences" ADD CONSTRAINT "preferences_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

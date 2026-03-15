/*
  Warnings:

  - You are about to drop the column `foodId` on the `foods` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `meals` table. All the data in the column will be lost.
  - You are about to drop the column `foodTime` on the `meals` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `meals` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `profiles` table. All the data in the column will be lost.
  - Added the required column `food_id` to the `foods` table without a default value. This is not possible if the table is not empty.
  - Added the required column `food_timee` to the `meals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `meals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_name` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `profiles` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "foods" DROP CONSTRAINT "foods_foodId_fkey";

-- AlterTable
ALTER TABLE "foods" DROP COLUMN "foodId",
ADD COLUMN     "food_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "meals" DROP COLUMN "createdAt",
DROP COLUMN "foodTime",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "food_timee" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "createdAt",
DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "last_name" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "foods" ADD CONSTRAINT "foods_food_id_fkey" FOREIGN KEY ("food_id") REFERENCES "meals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
insert into public.profiles (
    id,
    email,
    first_name,
    last_name,
    created_at,
    updated_at
)
values (
           new.id,
           coalesce(new.email, ''),
           coalesce(new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'firstName', ''),
           coalesce(new.raw_user_meta_data->>'last_name', new.raw_user_meta_data->>'lastName', ''),
           now(),
           now()
       )
    on conflict (id) do update
                            set
                                email = excluded.email,
                            first_name = excluded.first_name,
                            last_name = excluded.last_name,
                            updated_at = now();

return new;
end;
$$;



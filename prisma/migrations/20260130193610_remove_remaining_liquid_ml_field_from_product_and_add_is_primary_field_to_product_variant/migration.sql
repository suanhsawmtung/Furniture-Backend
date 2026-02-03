/*
  Warnings:

  - You are about to drop the column `remainingLiquidMl` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "remainingLiquidMl";

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "isPrimary" BOOLEAN NOT NULL DEFAULT false;

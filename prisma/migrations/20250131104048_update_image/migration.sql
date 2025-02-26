/*
  Warnings:

  - You are about to drop the column `pubilc_id` on the `image` table. All the data in the column will be lost.
  - Added the required column `public_id` to the `Image` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `image` DROP COLUMN `pubilc_id`,
    ADD COLUMN `public_id` VARCHAR(191) NOT NULL;

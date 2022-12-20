/*
  Warnings:

  - Added the required column `status` to the `transactionflows` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `transactionflows` ADD COLUMN `status` VARCHAR(191) NOT NULL;

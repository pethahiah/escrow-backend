/*
  Warnings:

  - You are about to drop the column `date_of_delivery` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `mode_of_delivery` on the `transactions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `orders` ADD COLUMN `date_of_delivery` DATE,
    ADD COLUMN `mode_of_delivery` VARCHAR(255);

-- AlterTable
ALTER TABLE `transactions` DROP COLUMN `date_of_delivery`,
    DROP COLUMN `mode_of_delivery`,
    ADD COLUMN `otherparty_category` VARCHAR(191);

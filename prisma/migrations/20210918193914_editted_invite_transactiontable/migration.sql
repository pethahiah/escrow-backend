/*
  Warnings:

  - You are about to alter the column `type` on the `invite_transaction_links` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to drop the `_invite_link` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_witness_invite_link` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_invite_link` DROP FOREIGN KEY `_invite_link_ibfk_1`;

-- DropForeignKey
ALTER TABLE `_invite_link` DROP FOREIGN KEY `_invite_link_ibfk_2`;

-- DropForeignKey
ALTER TABLE `_witness_invite_link` DROP FOREIGN KEY `_witness_invite_link_ibfk_1`;

-- DropForeignKey
ALTER TABLE `_witness_invite_link` DROP FOREIGN KEY `_witness_invite_link_ibfk_2`;

-- AlterTable
ALTER TABLE `invite_transaction_links` MODIFY `type` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `_invite_link`;

-- DropTable
DROP TABLE `_witness_invite_link`;

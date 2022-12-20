-- AlterTable
ALTER TABLE `invite_transaction_links` MODIFY `type` VARCHAR(255) NOT NULL;

-- CreateTable
CREATE TABLE `_invite_link` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_invite_link_AB_unique`(`A`, `B`),
    INDEX `_invite_link_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_witness_invite_link` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_witness_invite_link_AB_unique`(`A`, `B`),
    INDEX `_witness_invite_link_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_invite_link` ADD FOREIGN KEY (`A`) REFERENCES `invite_transaction_links`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_invite_link` ADD FOREIGN KEY (`B`) REFERENCES `invitees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_witness_invite_link` ADD FOREIGN KEY (`A`) REFERENCES `invite_witness_links`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_witness_invite_link` ADD FOREIGN KEY (`B`) REFERENCES `invitees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

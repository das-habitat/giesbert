/*
  Warnings:

  - The primary key for the `Channel` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `channel` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `userRef` on the `Notification` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[name]` on the table `Channel` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `Channel` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `channelRef` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `User` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userRef_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_userRef_fkey";

-- DropForeignKey
ALTER TABLE "UsersOnChannels" DROP CONSTRAINT "UsersOnChannels_channelRef_fkey";

-- DropForeignKey
ALTER TABLE "UsersOnChannels" DROP CONSTRAINT "UsersOnChannels_userRef_fkey";

-- AlterTable
ALTER TABLE "Channel" DROP CONSTRAINT "Channel_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "Channel_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "channel",
DROP COLUMN "userRef",
ADD COLUMN     "channelRef" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "channelRef" TEXT NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Telemetry" (
    "id" TEXT NOT NULL,
    "moisture" REAL NOT NULL,
    "battery" REAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deviceRef" TEXT NOT NULL,

    CONSTRAINT "Telemetry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Device_channelRef_name_key" ON "Device"("channelRef", "name");

-- CreateIndex
CREATE INDEX "Telemetry_deviceRef_createdAt_idx" ON "Telemetry"("deviceRef", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Channel_name_key" ON "Channel"("name");

-- CreateIndex
CREATE INDEX "Notification_channelRef_createdAt_idx" ON "Notification"("channelRef", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userRef_fkey" FOREIGN KEY ("userRef") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_channelRef_fkey" FOREIGN KEY ("channelRef") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Telemetry" ADD CONSTRAINT "Telemetry_deviceRef_fkey" FOREIGN KEY ("deviceRef") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_channelRef_fkey" FOREIGN KEY ("channelRef") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersOnChannels" ADD CONSTRAINT "UsersOnChannels_userRef_fkey" FOREIGN KEY ("userRef") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersOnChannels" ADD CONSTRAINT "UsersOnChannels_channelRef_fkey" FOREIGN KEY ("channelRef") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

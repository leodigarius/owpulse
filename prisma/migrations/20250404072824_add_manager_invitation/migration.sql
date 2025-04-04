/*
  Warnings:

  - You are about to drop the column `focusGroup` on the `Submission` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[focusGroupId]` on the table `Manager` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `focusGroupId` to the `Submission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Manager" ADD COLUMN     "focusGroupId" TEXT;

-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "focusGroup",
ADD COLUMN     "focusGroupId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "FocusGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FocusGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManagerInvitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ManagerInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FocusGroup_name_key" ON "FocusGroup"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ManagerInvitation_email_key" ON "ManagerInvitation"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ManagerInvitation_token_key" ON "ManagerInvitation"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Manager_focusGroupId_key" ON "Manager"("focusGroupId");

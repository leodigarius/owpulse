/*
  Warnings:

  - Added the required column `focusGroup` to the `Submission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "focusGroup" TEXT NOT NULL;

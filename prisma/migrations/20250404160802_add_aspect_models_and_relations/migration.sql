/*
  Warnings:

  - You are about to drop the column `negativeAspects` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `positiveAspects` on the `Submission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "negativeAspects",
DROP COLUMN "positiveAspects";

-- CreateTable
CREATE TABLE "positive_aspects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "positive_aspects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "negative_aspects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "negative_aspects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PositiveAspectToSubmission" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PositiveAspectToSubmission_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_NegativeAspectToSubmission" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_NegativeAspectToSubmission_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "positive_aspects_name_key" ON "positive_aspects"("name");

-- CreateIndex
CREATE UNIQUE INDEX "negative_aspects_name_key" ON "negative_aspects"("name");

-- CreateIndex
CREATE INDEX "_PositiveAspectToSubmission_B_index" ON "_PositiveAspectToSubmission"("B");

-- CreateIndex
CREATE INDEX "_NegativeAspectToSubmission_B_index" ON "_NegativeAspectToSubmission"("B");

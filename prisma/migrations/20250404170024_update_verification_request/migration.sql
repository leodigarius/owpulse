/*
  Warnings:

  - You are about to drop the `_NegativeAspectToSubmission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_PositiveAspectToSubmission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `negative_aspects` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `positive_aspects` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "negativeAspects" TEXT[],
ADD COLUMN     "positiveAspects" TEXT[];

-- DropTable
DROP TABLE "_NegativeAspectToSubmission";

-- DropTable
DROP TABLE "_PositiveAspectToSubmission";

-- DropTable
DROP TABLE "negative_aspects";

-- DropTable
DROP TABLE "positive_aspects";

-- CreateTable
CREATE TABLE "VerificationRequest" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),

    CONSTRAINT "VerificationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'MANAGER', 'ADMIN');

-- CreateTable
CREATE TABLE "AnonymousUser" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "region" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnonymousUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "anonymousUserId" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "overallMood" INTEGER,
    "positiveAspects" TEXT[],
    "negativeAspects" TEXT[],
    "hoursWorked" INTEGER,
    "comment" TEXT,
    "didNotWork" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "passwordHash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Manager" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Manager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegionalEvent" (
    "id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "headline" TEXT NOT NULL,
    "summary" TEXT,
    "source" TEXT,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegionalEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NegativeTrend" (
    "id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "trendType" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "lastDetected" TIMESTAMP(3) NOT NULL,
    "severity" INTEGER,
    "details" JSONB,
    "resolved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "NegativeTrend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegionalMessage" (
    "id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),

    CONSTRAINT "RegionalMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserMessageView" (
    "id" TEXT NOT NULL,
    "anonymousUserId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserMessageView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionLog" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actionType" TEXT NOT NULL,
    "details" JSONB,
    "anonymousUserId" TEXT,
    "managerId" TEXT,
    "adminId" TEXT,

    CONSTRAINT "ActionLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AnonymousUser_email_key" ON "AnonymousUser"("email");

-- CreateIndex
CREATE INDEX "AnonymousUser_email_idx" ON "AnonymousUser"("email");

-- CreateIndex
CREATE INDEX "AnonymousUser_region_idx" ON "AnonymousUser"("region");

-- CreateIndex
CREATE INDEX "Submission_anonymousUserId_idx" ON "Submission"("anonymousUserId");

-- CreateIndex
CREATE INDEX "Submission_region_timestamp_idx" ON "Submission"("region", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Manager_userId_key" ON "Manager"("userId");

-- CreateIndex
CREATE INDEX "Manager_userId_idx" ON "Manager"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_userId_key" ON "Admin"("userId");

-- CreateIndex
CREATE INDEX "Admin_userId_idx" ON "Admin"("userId");

-- CreateIndex
CREATE INDEX "RegionalEvent_region_eventDate_idx" ON "RegionalEvent"("region", "eventDate");

-- CreateIndex
CREATE UNIQUE INDEX "RegionalEvent_region_headline_eventDate_key" ON "RegionalEvent"("region", "headline", "eventDate");

-- CreateIndex
CREATE INDEX "NegativeTrend_region_resolved_lastDetected_idx" ON "NegativeTrend"("region", "resolved", "lastDetected");

-- CreateIndex
CREATE INDEX "RegionalMessage_region_createdAt_idx" ON "RegionalMessage"("region", "createdAt");

-- CreateIndex
CREATE INDEX "UserMessageView_anonymousUserId_idx" ON "UserMessageView"("anonymousUserId");

-- CreateIndex
CREATE INDEX "UserMessageView_messageId_idx" ON "UserMessageView"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "UserMessageView_anonymousUserId_messageId_key" ON "UserMessageView"("anonymousUserId", "messageId");

-- CreateIndex
CREATE INDEX "ActionLog_timestamp_idx" ON "ActionLog"("timestamp");

-- CreateIndex
CREATE INDEX "ActionLog_actionType_idx" ON "ActionLog"("actionType");

-- CreateIndex
CREATE INDEX "ActionLog_anonymousUserId_idx" ON "ActionLog"("anonymousUserId");

-- CreateIndex
CREATE INDEX "ActionLog_managerId_idx" ON "ActionLog"("managerId");

-- CreateIndex
CREATE INDEX "ActionLog_adminId_idx" ON "ActionLog"("adminId");

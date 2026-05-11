/*
  Warnings:

  - Made the column `header` on table `Startup` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('STARTUP', 'INVESTOR_FUND', 'ACCELERATOR_ENABLER', 'COMPANY_SUPPLY_CHAIN');

-- AlterTable
ALTER TABLE "Startup" ADD COLUMN     "category" TEXT,
ADD COLUMN     "tracks" TEXT,
ALTER COLUMN "header" SET NOT NULL;

-- CreateTable
CREATE TABLE "JoinSubmission" (
    "id" SERIAL NOT NULL,
    "organizationType" "OrganizationType" NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JoinSubmission_pkey" PRIMARY KEY ("id")
);

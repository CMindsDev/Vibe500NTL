-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Startup" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "operatingCountry" TEXT,
    "operatingCoordinates" TEXT,
    "basedCountry" TEXT,
    "basedCoordinates" TEXT,
    "header" TEXT,
    "description" TEXT,
    "video" TEXT,
    "image1" TEXT,
    "image2" TEXT,
    "impacto" TEXT,
    "data1" TEXT,
    "data2" TEXT,
    "data3" TEXT,
    "quote" TEXT,
    "quoteName" TEXT,
    "quotePhoto" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Startup_pkey" PRIMARY KEY ("id")
);


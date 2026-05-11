-- CreateEnum
CREATE TYPE "StartupMemberRole" AS ENUM ('OWNER', 'GUEST');

-- Make imported startup ids compatible with user-created startups.
CREATE SEQUENCE IF NOT EXISTS "Startup_id_seq";
SELECT setval('"Startup_id_seq"', COALESCE((SELECT MAX("id") FROM "Startup"), 0) + 1, false);
ALTER TABLE "Startup" ALTER COLUMN "id" SET DEFAULT nextval('"Startup_id_seq"');
ALTER SEQUENCE "Startup_id_seq" OWNED BY "Startup"."id";

-- CreateTable
CREATE TABLE "AccountUser" (
    "id" TEXT NOT NULL,
    "googleSub" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "picture" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StartupMembership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startupId" INTEGER NOT NULL,
    "role" "StartupMemberRole" NOT NULL DEFAULT 'GUEST',
    "invitedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StartupMembership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountUser_googleSub_key" ON "AccountUser"("googleSub");
CREATE UNIQUE INDEX "AccountUser_email_key" ON "AccountUser"("email");
CREATE UNIQUE INDEX "StartupMembership_userId_startupId_key" ON "StartupMembership"("userId", "startupId");
CREATE INDEX "StartupMembership_startupId_role_idx" ON "StartupMembership"("startupId", "role");

-- AddForeignKey
ALTER TABLE "StartupMembership" ADD CONSTRAINT "StartupMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AccountUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StartupMembership" ADD CONSTRAINT "StartupMembership_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "Startup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StartupMembership" ADD CONSTRAINT "StartupMembership_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "AccountUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
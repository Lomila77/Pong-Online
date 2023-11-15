-- CreateTable
CREATE TABLE "users" (
    "fortytwo_id" INTEGER NOT NULL,
    "fortytwo_picture" TEXT,
    "fortytwo_userName" TEXT NOT NULL,
    "fortytwo_email" TEXT NOT NULL,
    "pseudo" VARCHAR(20) NOT NULL DEFAULT '',
    "refresh_token" TEXT NOT NULL DEFAULT '0',
    "avatar" TEXT NOT NULL DEFAULT '0',
    "isF2Active" BOOLEAN NOT NULL DEFAULT false,
    "secretOf2FA" TEXT NOT NULL DEFAULT '0',
    "xp" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ratio" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,
    "connected" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("fortytwo_id")
);

-- CreateTable
CREATE TABLE "Channel" (
    "owner" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "password" TEXT,
    "creationDate" TIMESTAMP(3) NOT NULL,
    "userFortytwo_id" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_fortytwo_id_key" ON "users"("fortytwo_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_fortytwo_userName_key" ON "users"("fortytwo_userName");

-- CreateIndex
CREATE UNIQUE INDEX "users_fortytwo_email_key" ON "users"("fortytwo_email");

-- CreateIndex
CREATE UNIQUE INDEX "Channel_owner_key" ON "Channel"("owner");

-- CreateIndex
CREATE UNIQUE INDEX "Channel_name_key" ON "Channel"("name");

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_userFortytwo_id_fkey" FOREIGN KEY ("userFortytwo_id") REFERENCES "users"("fortytwo_id") ON DELETE RESTRICT ON UPDATE CASCADE;

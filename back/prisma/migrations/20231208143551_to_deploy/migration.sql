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
    "win" INTEGER NOT NULL DEFAULT 0,
    "ownerId" INTEGER,
    "friends" INTEGER[],
    "blocked" INTEGER[],
    "userChannels" INTEGER[],

    CONSTRAINT "users_pkey" PRIMARY KEY ("fortytwo_id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "channelId" INTEGER NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT,
    "isPassword" BOOLEAN NOT NULL DEFAULT false,
    "isDM" BOOLEAN NOT NULL DEFAULT false,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" INTEGER NOT NULL,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "winner_id" INTEGER NOT NULL,
    "looser_id" INTEGER NOT NULL,
    "end_timestamp" TIMESTAMP(3) NOT NULL,
    "score_winner" INTEGER NOT NULL,
    "score_looser" INTEGER NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_admins" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_members" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_banned" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_muted" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_invited" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_fortytwo_id_key" ON "users"("fortytwo_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_fortytwo_userName_key" ON "users"("fortytwo_userName");

-- CreateIndex
CREATE UNIQUE INDEX "users_fortytwo_email_key" ON "users"("fortytwo_email");

-- CreateIndex
CREATE UNIQUE INDEX "Channel_id_key" ON "Channel"("id");

-- CreateIndex
CREATE UNIQUE INDEX "_admins_AB_unique" ON "_admins"("A", "B");

-- CreateIndex
CREATE INDEX "_admins_B_index" ON "_admins"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_members_AB_unique" ON "_members"("A", "B");

-- CreateIndex
CREATE INDEX "_members_B_index" ON "_members"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_banned_AB_unique" ON "_banned"("A", "B");

-- CreateIndex
CREATE INDEX "_banned_B_index" ON "_banned"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_muted_AB_unique" ON "_muted"("A", "B");

-- CreateIndex
CREATE INDEX "_muted_B_index" ON "_muted"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_invited_AB_unique" ON "_invited"("A", "B");

-- CreateIndex
CREATE INDEX "_invited_B_index" ON "_invited"("B");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("fortytwo_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("fortytwo_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("fortytwo_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_admins" ADD CONSTRAINT "_admins_A_fkey" FOREIGN KEY ("A") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_admins" ADD CONSTRAINT "_admins_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("fortytwo_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_members" ADD CONSTRAINT "_members_A_fkey" FOREIGN KEY ("A") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_members" ADD CONSTRAINT "_members_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("fortytwo_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_banned" ADD CONSTRAINT "_banned_A_fkey" FOREIGN KEY ("A") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_banned" ADD CONSTRAINT "_banned_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("fortytwo_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_muted" ADD CONSTRAINT "_muted_A_fkey" FOREIGN KEY ("A") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_muted" ADD CONSTRAINT "_muted_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("fortytwo_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_invited" ADD CONSTRAINT "_invited_A_fkey" FOREIGN KEY ("A") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_invited" ADD CONSTRAINT "_invited_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("fortytwo_id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `channelName` on the `Channel` table. All the data in the column will be lost.
  - Added the required column `name` to the `Channel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Channel" DROP COLUMN "channelName",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "win" INTEGER NOT NULL DEFAULT 0;

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

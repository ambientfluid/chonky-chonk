"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Gamepad2,
  Play,
  Clock,
  Trophy,
  Skull,
  Minus,
  Users,
  HelpCircle,
  Swords,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { usePresence } from "@/lib/hooks/usePresence";
import { useGameInvite } from "@/lib/hooks/useGameInvite";
import { GameHelpDrawer } from "@/components/games/GameHelpDrawer";
import type { GameType, Profile } from "@/types/database";

interface GameWithPlayers {
  id: string;
  game_type: GameType;
  player1_id: string;
  player2_id: string;
  status: string;
  winner_id: string | null;
  current_turn: string;
  updated_at: string;
  player1: Profile;
  player2: Profile;
}

interface GameLobbyProps {
  gameType: GameType;
  userId: string;
  profile: Profile;
  activeGames: GameWithPlayers[];
  recentGames: GameWithPlayers[];
}

export function GameLobby({
  gameType,
  userId,
  profile,
  activeGames,
  recentGames,
}: GameLobbyProps) {
  const router = useRouter();
  const { onlineUsers } = usePresence();
  const { sendInvite, loading: inviteLoading } = useGameInvite({ userId });
  const [invitingUserId, setInvitingUserId] = useState<string | null>(null);
  const [inviteSent, setInviteSent] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  // Online users excluding self
  const availablePlayers = onlineUsers.filter((u) => u.user_id !== userId);

  async function handleInvite(targetUserId: string) {
    setInvitingUserId(targetUserId);
    await sendInvite(targetUserId, gameType);
    setInviteSent(targetUserId);
    setInvitingUserId(null);

    setTimeout(() => setInviteSent(null), 3000);
  }

  function getOpponent(game: GameWithPlayers): Profile {
    return game.player1_id === userId ? game.player2 : game.player1;
  }

  function getGameResult(game: GameWithPlayers) {
    if (!game.winner_id) return "draw";
    return game.winner_id === userId ? "win" : "loss";
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Invite Players - Main CTA */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-bubblegum-400 to-grape-400 text-white">
                  <Swords className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-gray-800">
                    Challenge a Player
                  </h2>
                  <p className="text-sm text-gray-500">
                    Invite someone online to play
                  </p>
                </div>
              </div>
              <button
                onClick={() => setHelpOpen(true)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-grape-500 transition-colors hover:bg-grape-50"
              >
                <HelpCircle className="h-4 w-4" />
                How to Play
              </button>
            </div>

            {availablePlayers.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-grape-200 bg-grape-50/50 py-10 text-center">
                <Users className="mx-auto h-10 w-10 text-grape-300" />
                <p className="mt-3 font-[family-name:var(--font-display)] text-lg font-bold text-grape-400">
                  No players online
                </p>
                <p className="mt-1 text-sm text-grape-400/70">
                  Invite friends from the Admin panel and wait for them to come
                  online!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {availablePlayers.map((player) => (
                  <div
                    key={player.user_id}
                    className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-3 transition-all hover:border-bubblegum-200 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={player.avatar_url}
                        name={player.screen_name}
                        size="md"
                        online
                      />
                      <div>
                        <p className="font-semibold text-gray-800">
                          {player.screen_name}
                        </p>
                        <p className="text-xs text-gray-400">Online now</p>
                      </div>
                    </div>

                    {inviteSent === player.user_id ? (
                      <Badge variant="green">Invite Sent!</Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleInvite(player.user_id)}
                        disabled={
                          inviteLoading && invitingUserId === player.user_id
                        }
                      >
                        <Gamepad2 className="mr-1.5 h-4 w-4" />
                        {inviteLoading && invitingUserId === player.user_id
                          ? "Sending..."
                          : "Challenge"}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Active Games */}
          {activeGames.length > 0 && (
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-lime-400 to-lime-500 text-white">
                  <Play className="h-5 w-5" />
                </div>
                <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-gray-800">
                  Active Games
                </h2>
              </div>

              <div className="space-y-2">
                {activeGames.map((game) => {
                  const opponent = getOpponent(game);
                  const isMyTurn = game.current_turn === userId;

                  return (
                    <button
                      key={game.id}
                      onClick={() =>
                        router.push(`/games/${gameType}/${game.id}`)
                      }
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all hover:shadow-md",
                        isMyTurn
                          ? "border-lime-300 bg-lime-50/50"
                          : "border-gray-100 bg-white"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={opponent.avatar_url}
                          name={opponent.screen_name}
                          size="md"
                        />
                        <div>
                          <p className="font-semibold text-gray-800">
                            vs {opponent.screen_name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {isMyTurn ? (
                              <span className="font-semibold text-lime-600">
                                Your turn!
                              </span>
                            ) : (
                              "Waiting for opponent..."
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isMyTurn && (
                          <span className="relative flex h-3 w-3">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-400 opacity-75" />
                            <span className="relative inline-flex h-3 w-3 rounded-full bg-lime-500" />
                          </span>
                        )}
                        <Badge variant={isMyTurn ? "green" : "gray"}>
                          {game.status === "waiting" ? "Waiting" : "In Progress"}
                        </Badge>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar - Recent Games */}
        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-grape-400 to-grape-500 text-white">
                <Clock className="h-5 w-5" />
              </div>
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-gray-800">
                Recent Games
              </h2>
            </div>

            {recentGames.length === 0 ? (
              <div className="py-6 text-center">
                <Gamepad2 className="mx-auto h-8 w-8 text-gray-300" />
                <p className="mt-2 text-sm text-gray-400">
                  No games played yet
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Challenge someone above to get started!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentGames.map((game) => {
                  const opponent = getOpponent(game);
                  const result = getGameResult(game);

                  return (
                    <div
                      key={game.id}
                      className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar
                          src={opponent.avatar_url}
                          name={opponent.screen_name}
                          size="sm"
                        />
                        <span className="text-sm font-medium text-gray-700 truncate max-w-[100px]">
                          {opponent.screen_name}
                        </span>
                      </div>

                      {result === "win" ? (
                        <Badge variant="green">
                          <Trophy className="mr-1 h-3 w-3" />
                          Win
                        </Badge>
                      ) : result === "loss" ? (
                        <Badge variant="pink">
                          <Skull className="mr-1 h-3 w-3" />
                          Loss
                        </Badge>
                      ) : (
                        <Badge variant="gray">
                          <Minus className="mr-1 h-3 w-3" />
                          Draw
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Quick Tips */}
          <Card className="bg-gradient-to-br from-grape-50 to-bubblegum-50">
            <h3 className="font-[family-name:var(--font-display)] text-sm font-bold text-grape-700">
              Quick Tip
            </h3>
            <p className="mt-1 text-xs text-grape-600/80">
              You can also invite players from the sidebar! Click on any online
              user to challenge them to a game.
            </p>
          </Card>
        </div>
      </div>

      <GameHelpDrawer
        gameType={gameType}
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
      />
    </>
  );
}

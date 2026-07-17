// import { GamePhase } from "@/lib/domain/game/game-types";

// export const PHASE_LABELS: Record<GamePhase, string> = {
//     [GamePhase.SETUP]: "Setup",
//     [GamePhase.PLACEMENT]: "Placement",
//     [GamePhase.BATTLE]: "Battle",
//     [GamePhase.GAME_OVER]: "Game Over",
// };

// export const PHASE_COLORS: Record<GamePhase, string> = {
//     [GamePhase.SETUP]: "text-gray-400",
//     [GamePhase.PLACEMENT]: "text-yellow-400",
//     [GamePhase.BATTLE]: "text-green-400",
//     [GamePhase.GAME_OVER]: "text-red-400",
// };

// export function getPhaseLabel(phase: GamePhase) {
//     return PHASE_LABELS[phase] ?? "Unknown";
// }

// export function getPhaseColor(phase: GamePhase) {
//     return PHASE_COLORS[phase] ?? "text-white";
// }

// export function getTurnLabel(turn: "player" | "ai") {
//     return turn === "player" ? "🎯 Your turn" : "🤖 AI's turn";
// }

// export function getTurnColor(turn: "player" | "ai") {
//     return turn === "player" ? "text-green-400" : "text-orange-400";
// }

// export function getButtonLabel(playerReady: boolean, aiReady: boolean) {
//     if (playerReady && aiReady) return "⚔️ Start Battle";
//     if (!playerReady) return "📍 Place your ships...";
//     if (!aiReady) return "⏳ Waiting for AI...";
//     return "Waiting...";
// }

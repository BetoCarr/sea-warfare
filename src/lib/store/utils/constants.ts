import type { GameConfig } from "../game-types";
import { BOARD_SIZE } from "@/lib/utils/constants";

/**
 * Default game configuration
 */
export const DEFAULT_CONFIG: GameConfig = {
    boardSize: BOARD_SIZE,
    aiDifficulty: 'easy',
    allowShipRotation: true,
    showAIShips: false
};
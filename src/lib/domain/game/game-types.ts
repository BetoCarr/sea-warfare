export enum GamePhase {
    SETUP = 'setup',
    PLACEMENT = 'placement',
    BATTLE = 'battle',
    GAME_OVER = 'game_over',
}

export enum GameStatus {
    IDLE = 'idle',

    PLACING_SHIPS = 'placing_ships',
    FLEET_READY = 'fleet_ready',

    PLAYER_TURN = 'player_turn',
    AI_TURN = 'ai_turn',
}

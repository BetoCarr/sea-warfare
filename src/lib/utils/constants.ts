export const BOARD_SIZE = 10;

export const SHIPS_CONFIG = {
    carrier: { size: 5, count: 1, name: 'Aircraft Carrier' },
    battleship: { size: 4, count: 1, name: 'Battleship' },
    cruiser: { size: 3, count: 1, name: 'Cruiser' },
    submarine: { size: 3, count: 1, name: 'Submarine' },
    destroyer: { size: 2, count: 1, name: 'Destroyer' }
} as const;
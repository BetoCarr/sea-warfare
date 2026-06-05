import { BaseShip } from './BaseShip';

export const STANDARD_FLEET: BaseShip[] = [
    {
        type: 'carrier',
        size: 5,
    },
    {
        type: 'battleship',
        size: 4,
    },
    {
        type: 'cruiser',
        size: 3,
    },
    {
        type: 'submarine',
        size: 3,
    },
    {
        type: 'destroyer',
        size: 2,
    },
];
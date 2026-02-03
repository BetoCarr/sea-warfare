import type { ShipType } from '@/lib/utils/types';

export type ShipSpec = {
    id: string;
    type: ShipType;
    size: number;
};
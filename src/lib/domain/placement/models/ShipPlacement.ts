import { BaseShip} from '../../ships/models/BaseShip';
import { Position } from '../../shared/models/Position';
import { Orientation } from './Orientation';

export type ShipPlacement = {
    ship: BaseShip;

    origin: Position;

    orientation: Orientation;
};
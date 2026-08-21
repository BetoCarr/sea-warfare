import ShipPalette from '../../../placement/ShipPalette';
import { ShipType } from '@/lib/domain/ships/models/ShipType';
import { STANDARD_FLEET } from '@/lib/domain/ships/models/StandardFleet';

interface PlacementBarProps {
    remainingShipTypes: ShipType[];
    selectedShipType: ShipType | null;
    onSelectShip: (shipType: ShipType) => void;
}

export default function PlacementBar({
    remainingShipTypes,
    selectedShipType,
    onSelectShip,
}: PlacementBarProps) {

    const remainingShips = STANDARD_FLEET.filter(ship =>
        remainingShipTypes.includes(ship.type),
    );

    return (
        <div className="w-full">
            <ShipPalette
                ships={remainingShips}
                selectedShipType={selectedShipType}
                onSelectShip={onSelectShip}
            />
        </div>
    );
}
import ShipPalette from './ShipPalette';
import { OrientationToggle } from './OrientationToggle';
import SecondaryInformation from './SecondaryInformation';
import { ShipType } from '@/lib/domain/ships/models/ShipType';
import { STANDARD_FLEET } from '@/lib/domain/ships/models/StandardFleet';
import { Orientation } from '@/lib/domain/placement/models/Orientation';
import { cn } from '@/lib/utils/utils';

interface PlacementBarProps {
    remainingShipTypes: ShipType[];
    selectedShipType: ShipType | null;
    orientation: Orientation;
    onSelectShip: (shipType: ShipType) => void;
    onRotate: () => void;
}

export default function PlacementBar({
    remainingShipTypes,
    selectedShipType,
    orientation,
    onSelectShip,
    onRotate,
}: PlacementBarProps) {

    const remainingShips = STANDARD_FLEET.filter(ship =>
        remainingShipTypes.includes(ship.type),
    );

    return (
        <div 
            className={cn(
                "w-full",
                "flex flex-wrap items-start gap-2",
                "mt-15"
            )}
        >
            <div
                className={cn(
                    "flex min-w-0 items-center gap-2",
                    "shrink-0",
                )}
            >
                <OrientationToggle onToggle={onRotate} />
                <SecondaryInformation
                    selectedShipType={selectedShipType}
                    orientation={orientation}
                />
            </div>

            <ShipPalette
                ships={remainingShips}
                selectedShipType={selectedShipType}
                onSelectShip={onSelectShip}
            />
        </div>
    );
}
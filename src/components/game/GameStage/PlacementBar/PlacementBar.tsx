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
                "h-[clamp(120px,16.7dvh,160px)]",
                "mb-3",
                // "flex flex-wrap"


                // "w-[219px] h-[500px] flex flex-col bg-gray-800 p-2", desktop
                // "[@media_(max-width:767px)_and_(orientation:portrait)]:w-full"

            )}
        >
            <div
                className={cn(
                    // Layout
                    "h-full min-h-0",
                    "flex flex-wrap items-start gap-2",
                )}
            >
                <div
                    className={cn(
                        "flex items-center gap-2",
                        "w-[200px] shrink-0",
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
        </div>
    );
}
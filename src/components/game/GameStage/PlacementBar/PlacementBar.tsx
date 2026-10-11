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
                "shrink-0",

                // Mobile Landscape
                "mobile-landscape:w-[260px]",
                "mobile-landscape:h-[clamp(210px,calc(138.46dvh_-_309px),300px)]",
            
                // Tablet Portrait
                "tablet-portrait:w-[clamp(420px,calc(22.73dvh_+_187.27px),500px)]",
                "tablet-portrait:h-[clamp(220px,calc(22.73dvh_-_12.73px),300px)]",
                "tablet-portrait:flex-col",
                "tablet-portrait:gap-2",
            )}
        >
            <div
                className={cn(
                    "flex w-full items-center gap-2",
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
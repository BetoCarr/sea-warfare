import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useBoardViewModel } from '../useBoardViewModel';
import type { ShipPlacement } from '@/lib/domain/placement/models/ShipPlacement';
import type { PlacementPreview } from '@/application/placement/derive/placement-preview.types';
import type { UseBoardViewModelParams } from '../useBoardViewModel';

function renderHook<Result>(hook: () => Result) {
    let currentResult: Result | undefined;

    function HookHarness() {
        currentResult = hook();
        return null;
    }

    renderToStaticMarkup(React.createElement(HookHarness));

    return {
        result: {
            current: currentResult as Result,
        },
    };
}

function renderBoard(overrides: Partial<UseBoardViewModelParams> = {}) {
    return renderHook(() =>
        useBoardViewModel({
            boardVariant: 'player',
            size: 3,
            playerPlacements: [],
            showShips: true,
            ...overrides,
        }),
    );
}

describe('useBoardViewModel', () => {
    it('builds a board of the requested size', () => {
        const { result } = renderBoard({ size: 5 });

        expect(result.current.size).toBe(5);
        expect(result.current.cells).toHaveLength(5);
        result.current.cells.forEach((row) => {
            expect(row).toHaveLength(5);
        });
    });

    it('preserves the cell coordinates for every generated view model', () => {
        const { result } = renderBoard({ size: 4 });

        result.current.cells.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                expect(cell.row).toBe(rowIndex);
                expect(cell.col).toBe(colIndex);
            });
        });
    });

    it('generates water presentations for an empty board', () => {
        const { result } = renderBoard();

        const cell = result.current.cells[0][0];

        expect(cell.presentation.visualState).toBe('water');
    });

    it('generates ship presentations for occupied cells', () => {
        const placement: ShipPlacement = {
            ship: { type: 'carrier', size: 2 },
            origin: { row: 0, col: 0 },
            orientation: 'horizontal',
        };

        const { result } = renderBoard({ playerPlacements: [placement] });

        const cell = result.current.cells[0][0];

        expect(cell.presentation.visualState).toBe('ship');
        expect(cell.shipType).toBe('carrier');
        expect(cell.presentation.className).toContain('bg-cyan-600');
    });

    it('hides shipType for active ships while a preview is active', () => {
        const placement: ShipPlacement = {
            ship: { type: 'destroyer', size: 2 },
            origin: { row: 1, col: 1 },
            orientation: 'vertical',
        };

        const preview: PlacementPreview = {
            isValid: true,
            cells: [{ row: 1, col: 1 }],
        };

        const { result } = renderBoard({
            playerPlacements: [placement],
            preview,
            selectedShipType: 'destroyer',
        });

        const cell = result.current.cells[1][1];

        expect(cell.shipType).toBeUndefined();
    });

    it('keeps shipType visible when no preview is active', () => {
        const placement: ShipPlacement = {
            ship: { type: 'submarine', size: 3 },
            origin: { row: 2, col: 2 },
            orientation: 'horizontal',
        };

        const { result } = renderBoard({
            size: 4,
            playerPlacements: [placement],
        });

        const cell = result.current.cells[2][2];

        expect(cell.shipType).toBe('submarine');
    });

    it('produces preview-valid presentations for valid previews', () => {
        const preview: PlacementPreview = {
            isValid: true,
            cells: [{ row: 0, col: 1 }],
        };

        const { result } = renderBoard({ preview });

        const cell = result.current.cells[0][1];

        expect(cell.presentation.visualState).toBe('preview-valid');
    });

    it('produces preview-invalid presentations for invalid previews', () => {
        const preview: PlacementPreview = {
            isValid: false,
            cells: [{ row: 0, col: 2 }],
        };

        const { result } = renderBoard({ preview });

        const cell = result.current.cells[0][2];

        expect(cell.presentation.visualState).toBe('preview-invalid');
    });

    it('hides ships on enemy boards', () => {
        const placement: ShipPlacement = {
            ship: { type: 'battleship', size: 4 },
            origin: { row: 0, col: 0 },
            orientation: 'horizontal',
        };

        const { result } = renderBoard({
            boardVariant: 'enemy',
            playerPlacements: [placement],
        });

        const cell = result.current.cells[0][0];

        // showShips intentionally remains true.
        // Enemy boards must hide ships regardless of this flag.
        expect(cell.presentation.visualState).toBe('water');
    });
});

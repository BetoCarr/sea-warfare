// components/TempStoreTest.tsx
'use client';

import { useTemporaryGameStore } from '@/lib/stores/temporary-game-store';
import { GamePhase, GameStatus } from '@/lib/stores/game-types';

export default function TempStoreTest() {
    const phase = useTemporaryGameStore(state => state.phase);
    const status = useTemporaryGameStore(state => state.status);
    const setPhase = useTemporaryGameStore(state => state.setPhase);
    const setStatus = useTemporaryGameStore(state => state.setStatus);
    
    return (
        <div className="p-4 border rounded">
            <h2 className="text-xl font-bold mb-4">🧪 Temp Store Test</h2>
            
            <div className="mb-4">
                <p><strong>Phase:</strong> {phase}</p>
                <p><strong>Status:</strong> {status}</p>
            </div>
            
            <div className="space-x-2">
                <button 
                    onClick={() => setPhase(GamePhase.PLACEMENT)}
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                    Set PLACEMENT Phase
                </button>
                
                <button 
                    onClick={() => setStatus(GameStatus.PLACING_SHIPS)}
                    className="px-4 py-2 bg-green-500 text-white rounded"
                >
                    Set PLACING_SHIPS Status
                </button>
            </div>
        </div>
    );
}
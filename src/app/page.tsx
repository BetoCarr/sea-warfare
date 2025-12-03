'use client';
import { GameScreen } from "@/components/game/GameScreen";
export default function Home() {
    return (
        <main className="p-8">
            <h1 className="text-2xl font-bold">Sea Warfare (WIP)</h1>
            <p className="mt-4">Development environment active.</p>
            <GameScreen />
        </main>
    );
}

"use client";

// import { PlayerBoard } from "./PlayerBoard";   // luego los crearemos
// import { AIBoard } from "./AIBoard";
import { Sidebar } from "./Sidebar";

export function GameScreen() {
    return (
        <main className="min-h-screen w-full bg-slate-900 text-white flex justify-center py-8 px-4">
            <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Player Board */}
                <section className="md:col-span-1 bg-slate-800 rounded-xl p-4 shadow-lg">
                    <h2 className="text-center mb-4 text-lg font-semibold text-sky-300">
                        Your Fleet
                    </h2>
                    {/* <PlayerBoard /> */}
                </section>

                {/* Sidebar (middle panel) */}
                <section className="md:col-span-1 bg-slate-800 rounded-xl p-4 shadow-lg flex flex-col gap-4">
                    <Sidebar />
                </section>

                {/* AI Board */}
                <section className="md:col-span-1 bg-slate-800 rounded-xl p-4 shadow-lg">
                    <h2 className="text-center mb-4 text-lg font-semibold text-red-300">
                        Enemy Waters
                    </h2>
                    {/* <AIBoard /> */}
                </section>
            </div>
        </main>
    );
}

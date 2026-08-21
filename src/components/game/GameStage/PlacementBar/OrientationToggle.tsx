interface OrientationToggleProps {
    onToggle: () => void;
}

export function OrientationToggle({ onToggle }: OrientationToggleProps) {
    return (
        <button 
            onClick={onToggle}
            className="group flex items-center gap-2 text-[8px] sm:text-[9px] text-slate-500/80 font-mono transition-colors hover:text-slate-300"
            aria-label="Rotate"
        >
            <span className="bg-slate-800/50 px-1 rounded border border-slate-700/30 text-slate-400 font-bold transition-all group-hover:border-slate-500/50">
                R
            </span>
            <span className="italic uppercase tracking-wider">
                Rotate
            </span>
        </button>
    );
}

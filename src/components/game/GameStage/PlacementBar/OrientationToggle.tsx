interface OrientationToggleProps {
    onToggle: () => void;
}

export function OrientationToggle({ onToggle }: OrientationToggleProps) {
    return (
        <button
            onClick={onToggle}
            className="
                w-full h-12
                flex items-center justify-center gap-3
                rounded-md
                border border-slate-700
                bg-slate-800
                text-xs font-mono uppercase tracking-wider
                text-slate-300
                transition-all duration-200
                hover:border-slate-500
                hover:bg-slate-700
                hover:text-slate-100
                active:scale-[0.98]
            "
            aria-label="Rotate"
        >
            <span className="px-1.5 py-0.5 rounded border border-slate-600 text-slate-400">
                R
            </span>

            <span>Rotate</span>
        </button>
    );
}

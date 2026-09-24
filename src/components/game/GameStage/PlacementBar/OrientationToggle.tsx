interface OrientationToggleProps {
    onToggle: () => void;
}

export function OrientationToggle({ onToggle }: OrientationToggleProps) {
    return (
        <button
            onClick={onToggle}
            className="
                w-20 shrink-0
                h-12
                flex items-center justify-center gap-2
                rounded-md
                border border-slate-700
                bg-slate-800
                text-xs                
                font-mono uppercase tracking-wider
                text-slate-300
                transition-all duration-200
                hover:border-slate-500
                hover:bg-slate-700
                hover:text-slate-100
                active:scale-[0.98]
            "
            aria-label="Rotate"
        >
            <span className="rounded border border-slate-600 px-[clamp(0.25rem,0.75vw,0.375rem)] py-0.5 text-slate-400">
                R
            </span>

            <span>Rotate</span>
        </button>
    );
}
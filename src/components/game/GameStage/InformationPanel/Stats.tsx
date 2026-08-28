interface StatsProps {
    stats: string;
}

export default function Stats({ stats }: StatsProps) {
    return (
        <section className="w-full max-w-[260px] min-h-[93px] md:h-[93px] border border-slate-700/50 p-2">
            <h2>Stats</h2>
            <p>{stats}</p>
        </section>
    );
}

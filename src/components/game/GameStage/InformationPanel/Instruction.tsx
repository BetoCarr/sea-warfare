interface InstructionProps {
    instruction: string;
}

export default function Instruction({ instruction }: InstructionProps) {
    return (
        <section className="w-full max-w-[260px] min-h-[93px] md:h-[93px] border border-slate-700/50 p-2">
            <h2>{instruction}</h2>
        </section>
    );
}

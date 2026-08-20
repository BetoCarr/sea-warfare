interface InstructionProps {
    instruction: string;
}

export default function Instruction({ instruction }: InstructionProps) {
    return (
        <section className="border border-slate-700/50 p-2">
            <h2>{instruction}</h2>
        </section>
    );
}

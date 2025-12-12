"use client";

type PanelProps = {
  className?: string;
  children: React.ReactNode;
};

export const Panel: React.FC<PanelProps> = ({ className = "", children }) => (
  <div
    className={`bg-slate-800 p-3 rounded border border-slate-700 space-y-3 ${className}`.trim()}
  >
    {children}
  </div>
);

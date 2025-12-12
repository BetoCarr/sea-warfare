"use client";

type StatRowProps = {
  label: React.ReactNode;
  value: React.ReactNode;
  /** optional Tailwind classes for label */
  labelClass?: string;
  /** optional Tailwind classes for value */
  valueClass?: string;
};

export const StatRow: React.FC<StatRowProps> = ({
  label,
  value,
  labelClass = "",
  valueClass = "",
}) => (
  <div className="flex items-center justify-between">
    <span className={labelClass}>{label}</span>
    <span className={valueClass}>{value}</span>
  </div>
);

import React from "react";

type FlexRowProps = {
  gap?: number; // Tailwind gap unit (1 = 0.25rem)
  className?: string;
  children: React.ReactNode;
};

export const FlexRow: React.FC<FlexRowProps> = ({
  gap = 2,
  className = "",
  children,
}) => (
  <div className={`flex items-center gap-${gap} ${className}`.trim()}>
    {children}
  </div>
);

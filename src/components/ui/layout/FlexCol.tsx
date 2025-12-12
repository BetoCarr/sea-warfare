import React from "react";

type FlexColProps = {
  gap?: number; // Tailwind gap unit (1 = 0.25rem)
  className?: string;
  children: React.ReactNode;
};

export const FlexCol: React.FC<FlexColProps> = ({
  gap = 2,
  className = "",
  children,
}) => (
  <div className={`flex flex-col gap-${gap} ${className}`.trim()}>
    {children}
  </div>
);

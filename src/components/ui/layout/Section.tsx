"use client";

import { Badge } from "@/components/ui/Badge";
import { FlexCol } from "./FlexCol";

type SectionProps = {
  title: string;
  className?: string;
  children: React.ReactNode;
};

export const Section: React.FC<SectionProps> = ({
  title,
  className = "",
  children,
}) => (
  <FlexCol className={className}>
    <Badge className="text-sm text-slate-400">{title}</Badge>
    {children}
  </FlexCol>
);

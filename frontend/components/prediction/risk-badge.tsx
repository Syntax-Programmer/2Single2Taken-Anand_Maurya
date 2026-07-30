import { Badge } from "@/components/ui/badge";
import type { ComplexityLevel } from "@/types/prediction";

const variantMap: Record<ComplexityLevel, "low" | "medium" | "high"> = {
  Low: "low",
  Medium: "medium",
  High: "high",
};

export function RiskBadge({ level }: { level: ComplexityLevel }) {
  return (
    <Badge variant={variantMap[level]} className="px-4 py-1.5 text-[13px]">
      {level}
    </Badge>
  );
}

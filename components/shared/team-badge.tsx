import { cn } from "@/lib/utils";
import { Team } from "@/types";

interface TeamBadgeProps {
  team: Pick<Team, "code" | "primaryColor" | "secondaryColor" | "name">;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE_MAP = {
  xs: "size-6 text-[9px]",
  sm: "size-8 text-[10px]",
  md: "size-10 text-xs",
  lg: "size-14 text-sm",
  xl: "size-20 text-lg",
};

export function TeamBadge({ team, size = "md", className }: TeamBadgeProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-bold ring-1 ring-white/10",
        SIZE_MAP[size],
        className
      )}
      style={{
        background: `linear-gradient(135deg, ${team.primaryColor}, color-mix(in srgb, ${team.primaryColor} 55%, black))`,
        color: team.secondaryColor,
      }}
      title={team.name}
      aria-hidden
    >
      {team.code}
    </div>
  );
}

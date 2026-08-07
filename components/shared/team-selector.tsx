import { Team } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TeamBadge } from "@/components/shared/team-badge";

interface TeamSelectorProps {
  teams: Team[];
  value: string;
  onChange: (value: string) => void;
  excludeId?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function TeamSelector({ teams, value, onChange, excludeId, placeholder = "Selecciona un equipo", disabled }: TeamSelectorProps) {
  const options = teams.filter((t) => t.id !== excludeId);

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((team) => (
          <SelectItem key={team.id} value={team.id}>
            <span className="flex items-center gap-2">
              <TeamBadge team={team} size="xs" />
              {team.name}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

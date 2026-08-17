import { competitions } from "@/data/competitions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CompetitionSelectorProps {
  value: string;
  onChange: (value: string) => void;
  includeAllOption?: boolean;
  disabled?: boolean;
  options?: { id: string; name: string }[];
}

export function CompetitionSelector({ value, onChange, includeAllOption, disabled, options }: CompetitionSelectorProps) {
  const list = options ?? competitions;
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Competición" />
      </SelectTrigger>
      <SelectContent>
        {includeAllOption && <SelectItem value="all">Todas las competiciones</SelectItem>}
        {list.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

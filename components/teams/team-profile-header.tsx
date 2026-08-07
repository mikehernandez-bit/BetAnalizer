import { Team } from "@/types";
import { getCompetitionById } from "@/data/competitions";
import { TeamBadge } from "@/components/shared/team-badge";
import { FormIndicator } from "@/components/shared/form-indicator";
import { FavoriteButton } from "@/components/shared/favorite-button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, CalendarClock, Trophy } from "lucide-react";

export function TeamProfileHeader({ team }: { team: Team }) {
  const competition = getCompetitionById(team.competitionId);

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
        <TeamBadge team={team} size="xl" />
        <div className="flex-1">
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">{team.name}</h2>
              <p className="mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground sm:justify-start">
                <span className="flex items-center gap-1">
                  <Trophy className="size-3.5" /> {competition?.name}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5" /> {team.stadium}
                </span>
                <span className="flex items-center gap-1">
                  <CalendarClock className="size-3.5" /> Fundado en {team.founded}
                </span>
              </p>
            </div>
            <FavoriteButton type="team" refId={team.id} label={team.name} meta={competition?.name} variant="full" />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 sm:justify-start">
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{team.position}°</p>
              <p className="text-[10px] text-muted-foreground">Posición</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{team.points}</p>
              <p className="text-[10px] text-muted-foreground">Puntos</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">
                {team.won}-{team.drawn}-{team.lost}
              </p>
              <p className="text-[10px] text-muted-foreground">G-E-P</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">
                {team.goalsFor}:{team.goalsAgainst}
              </p>
              <p className="text-[10px] text-muted-foreground">Goles</p>
            </div>
            <FormIndicator results={team.form} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

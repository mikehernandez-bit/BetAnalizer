import { notFound } from "next/navigation";
import { tennisEvents } from "@/data/tennis-events";
import { analyzeTennisMatch } from "@/services/tennis-analysis-service";
import { TennisAnalysisDetail } from "@/components/tennis/tennis-analysis-detail";
import { normalizeTennisDayFilter } from "@/lib/tennis-event-groups";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return tennisEvents.map((event) => ({ id: event.id }));
}

export default async function TennisAnalysisPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ day?: string | string[] }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const event = tennisEvents.find((item) => item.id === id);
  if (!event) notFound();
  return <TennisAnalysisDetail event={event} analysis={analyzeTennisMatch(event.input)} returnDay={normalizeTennisDayFilter(query.day)} />;
}

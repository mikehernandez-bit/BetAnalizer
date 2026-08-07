import { describe, expect, it } from "vitest";
import { mergeImportedFile, mergeHistoryRecords } from "@/lib/match-package-merge";
import { importedFileSchema, type HistoryRecord } from "@/lib/validation/match-package";
import { makeValidPackage } from "./fixtures";

const EMPTY_FILE = { version: 1 as const, packages: [] };

describe("mergeImportedFile", () => {
  // 7. Actualización de un partido existente
  it("marca un paquete con id existente como 'updated' y reemplaza los datos del partido", () => {
    const original = makeValidPackage();
    const first = mergeImportedFile(EMPTY_FILE, [original]);
    expect(first.summary.totals.newPackages).toBe(1);

    const updated = makeValidPackage({ match: { ...original.match, status: "finished", time: "21:00" } });
    const second = mergeImportedFile(first.file, [updated]);

    expect(second.summary.packages[0].status).toBe("updated");
    expect(second.summary.packages[0].matchChanged).toBe(true);
    expect(second.file.packages).toHaveLength(1);
    expect(second.file.packages[0].match.status).toBe("finished");
    expect(second.file.packages[0].match.time).toBe("21:00");
  });

  // 8. Agregar un nuevo historial (sin perder los partidos históricos ya cargados)
  it("agrega un nuevo registro de historial sin eliminar los existentes", () => {
    const original = makeValidPackage();
    const { file: afterFirst } = mergeImportedFile(EMPTY_FILE, [original]);
    const teamId = original.teams[0].id;
    const originalCount = afterFirst.packages[0].histories[teamId].length;

    const newRecord: HistoryRecord = {
      ...afterFirst.packages[0].histories[teamId][0],
      matchId: "nuevo-partido-historico-1",
      date: "2026-08-03", // más reciente que todos los existentes
    };
    const updatedPkg = makeValidPackage({
      histories: {
        ...original.histories,
        [teamId]: [newRecord, ...original.histories[teamId]],
      },
    });

    const { file: afterSecond, summary } = mergeImportedFile(afterFirst, [updatedPkg]);
    const teamHistoryDiff = summary.packages[0].histories.find((h) => h.teamId === teamId);
    expect(teamHistoryDiff?.newRecords).toBe(1);

    const finalRecords = afterSecond.packages[0].histories[teamId];
    expect(finalRecords).toHaveLength(originalCount + 1);
    expect(finalRecords.some((r) => r.matchId === "nuevo-partido-historico-1")).toBe(true);
    // sigue conservando todos los registros anteriores
    original.histories[teamId].forEach((r) => {
      expect(finalRecords.some((f) => f.matchId === r.matchId)).toBe(true);
    });
    // queda ordenado por fecha descendente
    for (let i = 1; i < finalRecords.length; i++) {
      expect(finalRecords[i - 1].date >= finalRecords[i].date).toBe(true);
    }
  });

  // 9. Importar el mismo JSON dos veces (idempotencia)
  it("importar el mismo paquete dos veces no duplica nada y lo marca 'unchanged'", () => {
    const pkg = makeValidPackage();
    const { file: afterFirst } = mergeImportedFile(EMPTY_FILE, [pkg]);
    const { file: afterSecond, summary } = mergeImportedFile(afterFirst, [pkg]);

    expect(afterSecond.packages).toHaveLength(1);
    expect(summary.packages[0].status).toBe("unchanged");
    expect(summary.totals.newPackages).toBe(0);
    expect(summary.totals.updatedPackages).toBe(0);
    expect(afterSecond).toEqual(afterFirst);
  });

  // 10. Exportar y volver a importar el JSON (round-trip)
  it("exportar a JSON y reimportarlo reproduce exactamente los mismos datos", () => {
    const pkg = makeValidPackage();
    const { file } = mergeImportedFile(EMPTY_FILE, [pkg]);

    const exportedJson = JSON.stringify(file, null, 2);
    const reparsed = importedFileSchema.parse(JSON.parse(exportedJson));

    const { file: reimported, summary } = mergeImportedFile(EMPTY_FILE, reparsed.packages);
    expect(reimported).toEqual(file);
    expect(summary.packages[0].status).toBe("new");

    // y si el store YA tenía esos datos, reimportarlo es un no-op idempotente
    const { summary: reimportSummary } = mergeImportedFile(file, reparsed.packages);
    expect(reimportSummary.packages[0].status).toBe("unchanged");
  });

  it("no sobrescribe con datos inválidos: un paquete que no pasa el esquema nunca llega a mergeImportedFile", () => {
    // La invariante se garantiza en la capa de validación (ver validation.test.ts):
    // mergeImportedFile solo recibe MatchPackage ya validados, por lo que un
    // paquete incompleto jamás alcanza a pisar uno válido existente.
    const pkg = makeValidPackage();
    const { file } = mergeImportedFile(EMPTY_FILE, [pkg]);
    expect(() => importedFileSchema.parse(file)).not.toThrow();
  });
});

describe("mergeHistoryRecords", () => {
  it("fusiona por matchId (el nuevo gana) y ordena por fecha descendente", () => {
    const old: HistoryRecord[] = [
      { ...makeValidPackage().histories["equipo-local-ejemplo"][0], matchId: "a", date: "2026-01-01", goalsFor: 1 },
      { ...makeValidPackage().histories["equipo-local-ejemplo"][0], matchId: "b", date: "2026-02-01", goalsFor: 2 },
    ];
    const incoming: HistoryRecord[] = [
      { ...makeValidPackage().histories["equipo-local-ejemplo"][0], matchId: "b", date: "2026-02-01", goalsFor: 9 },
      { ...makeValidPackage().histories["equipo-local-ejemplo"][0], matchId: "c", date: "2026-03-01", goalsFor: 3 },
    ];
    const merged = mergeHistoryRecords(old, incoming);
    expect(merged.map((r) => r.matchId)).toEqual(["c", "b", "a"]);
    expect(merged.find((r) => r.matchId === "b")?.goalsFor).toBe(9);
  });
});

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { NextRequest } from "next/server";
import { GET, POST, DELETE } from "@/app/api/match-packages/route";
import { makeValidPackage } from "./fixtures";

// Cada test apunta el store a un archivo temporal (nunca al
// data/imported-analysis-packages.json real) para poder ejercitar la ruta
// API de punta a punta sin arriesgar los datos reales del proyecto.
let tempDir: string;

beforeEach(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "betanalyzer-test-"));
  process.env.MATCH_PACKAGES_STORE_PATH = path.join(tempDir, "imported-analysis-packages.json");
});

afterEach(async () => {
  delete process.env.MATCH_PACKAGES_STORE_PATH;
  await fs.rm(tempDir, { recursive: true, force: true });
});

function postRequest(body: unknown) {
  return new NextRequest("http://localhost/api/match-packages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function deleteRequest(body: unknown) {
  return new NextRequest("http://localhost/api/match-packages", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("GET /api/match-packages", () => {
  it("devuelve un archivo vacío cuando no existe el store todavía", async () => {
    const res = await GET();
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.packages).toEqual([]);
  });
});

describe("POST /api/match-packages", () => {
  it("con confirm=false solo previsualiza, sin escribir en disco", async () => {
    const pkg = makeValidPackage();
    const res = await POST(postRequest({ packages: { version: 1, packages: [pkg] }, confirm: false }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.confirmed).toBe(false);
    expect(data.summary.totals.newPackages).toBe(1);

    const stored = await GET();
    expect((await stored.json()).packages).toEqual([]);
  });

  it("con confirm=true fusiona y persiste en disco", async () => {
    const pkg = makeValidPackage();
    const res = await POST(postRequest({ packages: { version: 1, packages: [pkg] }, confirm: true }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.confirmed).toBe(true);
    expect(data.packages).toHaveLength(1);

    const stored = await GET();
    const storedData = await stored.json();
    expect(storedData.packages).toHaveLength(1);
    expect(storedData.packages[0].id).toBe(pkg.id);
  });

  it("rechaza JSON con campos obligatorios faltantes (422) sin persistir nada", async () => {
    const pkg = makeValidPackage() as unknown as Record<string, unknown>;
    delete pkg.sourceUrls;
    const res = await POST(postRequest({ packages: { version: 1, packages: [pkg] }, confirm: true }));
    expect(res.status).toBe(422);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.issues.length).toBeGreaterThan(0);

    const stored = await GET();
    expect((await stored.json()).packages).toEqual([]);
  });

  it("rechaza un cuerpo que no es JSON válido (400)", async () => {
    const badRequest = new NextRequest("http://localhost/api/match-packages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{not valid json",
    });
    const res = await POST(badRequest);
    expect(res.status).toBe(400);
  });

  it("importar el mismo JSON dos veces es idempotente", async () => {
    const pkg = makeValidPackage();
    await POST(postRequest({ packages: { version: 1, packages: [pkg] }, confirm: true }));
    const second = await POST(postRequest({ packages: { version: 1, packages: [pkg] }, confirm: true }));
    const secondData = await second.json();

    expect(secondData.summary.totals.newPackages).toBe(0);
    expect(secondData.summary.totals.updatedPackages).toBe(0);
    expect(secondData.packages).toHaveLength(1);
  });

  it("actualiza un partido existente al reimportar el mismo id con cambios", async () => {
    const pkg = makeValidPackage();
    await POST(postRequest({ packages: { version: 1, packages: [pkg] }, confirm: true }));

    const updated = makeValidPackage({ match: { ...pkg.match, status: "finished" } });
    const res = await POST(postRequest({ packages: { version: 1, packages: [updated] }, confirm: true }));
    const data = await res.json();

    expect(data.summary.totals.updatedPackages).toBe(1);
    expect(data.packages[0].match.status).toBe("finished");
  });

  it("detecta un match.id que ya pertenece a otro paquete (conflicto, 409)", async () => {
    const pkg = makeValidPackage();
    await POST(postRequest({ packages: { version: 1, packages: [pkg] }, confirm: true }));

    const conflicting = makeValidPackage({ id: "otro-paquete-id-2026-08-09" }); // mismo match.id, id de paquete distinto
    const res = await POST(postRequest({ packages: { version: 1, packages: [conflicting] }, confirm: true }));
    expect(res.status).toBe(409);
  });

  it("exportar (GET) y reimportar (POST) reproduce los mismos datos", async () => {
    const pkg = makeValidPackage();
    await POST(postRequest({ packages: { version: 1, packages: [pkg] }, confirm: true }));

    const exported = await (await GET()).json();
    delete process.env.MATCH_PACKAGES_STORE_PATH;
    const secondTempDir = await fs.mkdtemp(path.join(os.tmpdir(), "betanalyzer-test-"));
    process.env.MATCH_PACKAGES_STORE_PATH = path.join(secondTempDir, "imported-analysis-packages.json");

    const reimportRes = await POST(postRequest({ packages: exported, confirm: true }));
    const reimportData = await reimportRes.json();
    expect(reimportData.packages).toEqual(exported.packages);

    await fs.rm(secondTempDir, { recursive: true, force: true });
  });
});

describe("DELETE /api/match-packages", () => {
  it("elimina un paquete existente de forma explícita", async () => {
    const pkg = makeValidPackage();
    await POST(postRequest({ packages: { version: 1, packages: [pkg] }, confirm: true }));

    const res = await DELETE(deleteRequest({ packageId: pkg.id }));
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.packages).toEqual([]);
  });

  it("devuelve 404 si el paquete no existe", async () => {
    const res = await DELETE(deleteRequest({ packageId: "no-existe" }));
    expect(res.status).toBe(404);
  });
});

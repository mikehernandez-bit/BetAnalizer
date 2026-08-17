import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" arma una carpeta .next/standalone con solo lo necesario para
  // correr en producción (server.js + node_modules mínimos) — es lo que
  // recomienda Next.js para imágenes Docker chicas y rápidas de levantar.
  output: "standalone",
};

export default nextConfig;

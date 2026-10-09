import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Served at the root of its own subdomain, admin.rasatobacco.com (Vercel
// services rewrite every request on that host to this app).
export default defineConfig({
  base: "/",
  // Share the storefront's local Supabase configuration. Deployment values
  // supplied by the host still take precedence over values in this file.
  envDir: "..",
  plugins: [react(), tailwindcss()],
  build: { outDir: "dist" },
  server: { port: 5174 },
});

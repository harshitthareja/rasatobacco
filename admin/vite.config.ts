import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Served at /admin/ on the same domain as the storefront (Vercel services
// rewrite /admin/* to this app). Assets are referenced as /admin/assets/…;
// the build script also copies dist/admin/ to dist/ so the files resolve
// whether or not the rewrite keeps the /admin prefix.
export default defineConfig({
  base: "/admin/",
  plugins: [react(), tailwindcss()],
  build: { outDir: "dist/admin" },
  server: { port: 5174 },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Served at /admin/ on the same domain as the storefront (Vercel services
// rewrite /admin/* to this app with the path intact), so asset URLs and the
// build output both live under /admin/.
export default defineConfig({
  base: "/admin/",
  plugins: [react(), tailwindcss()],
  build: { outDir: "dist/admin", emptyOutDir: true },
  server: { port: 5174 },
});

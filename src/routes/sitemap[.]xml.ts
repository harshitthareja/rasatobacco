import { createFileRoute } from "@tanstack/react-router";
import { buildSitemap } from "@/lib/sitemap";

// Built from the catalogue on each request, so new products are listed as
// soon as they are added to src/data.
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () =>
        new Response(buildSitemap(), {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        }),
    },
  },
});

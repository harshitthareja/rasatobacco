import { createFileRoute } from "@tanstack/react-router";

import { CollectionExperience } from "@/components/CollectionExperience";
import { getCollection } from "@/data/collections";

const collection = getCollection("tarkib")!;

export const Route = createFileRoute("/collections/tarkib")({
  head: () => ({
    meta: [
      { title: `${collection.name} — ${collection.expression} | RASA` },
      { name: "description", content: collection.intro },
      { property: "og:title", content: `${collection.name} — ${collection.expression} | RASA` },
      { property: "og:description", content: collection.intro },
    ],
  }),
  component: TarkibPage,
});

function TarkibPage() {
  return <CollectionExperience collection={collection} />;
}
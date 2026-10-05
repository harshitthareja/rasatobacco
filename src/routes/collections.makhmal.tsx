import { createFileRoute } from "@tanstack/react-router";

import { CollectionExperience } from "@/components/CollectionExperience";
import { getCollection } from "@/data/collections";

const collection = getCollection("makhmal")!;

export const Route = createFileRoute("/collections/makhmal")({
  head: () => ({
    meta: [
      { title: `${collection.name} — ${collection.expression} | RASA` },
      { name: "description", content: collection.intro },
      { property: "og:title", content: `${collection.name} — ${collection.expression} | RASA` },
      { property: "og:description", content: collection.intro },
    ],
  }),
  component: MakhmalPage,
});

function MakhmalPage() {
  return <CollectionExperience collection={collection} />;
}
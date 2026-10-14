import { createFileRoute } from "@tanstack/react-router";

import { CollectionExperience } from "@/components/CollectionExperience";
import { getCollection } from "@/data/collections";
import { collectionHead } from "@/lib/productSeo";

const collection = getCollection("tarkib")!;

export const Route = createFileRoute("/collections/tarkib")({
  head: () => collectionHead(collection),
  component: TarkibPage,
});

function TarkibPage() {
  return <CollectionExperience collection={collection} />;
}
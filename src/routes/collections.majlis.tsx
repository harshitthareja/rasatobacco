import { createFileRoute } from "@tanstack/react-router";

import { CollectionExperience } from "@/components/CollectionExperience";
import { getCollection } from "@/data/collections";
import { collectionHead } from "@/lib/productSeo";

const collection = getCollection("majlis")!;

export const Route = createFileRoute("/collections/majlis")({
  head: () => collectionHead(collection),
  component: MajlisPage,
});

function MajlisPage() {
  return <CollectionExperience collection={collection} />;
}
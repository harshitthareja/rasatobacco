import { createFileRoute } from "@tanstack/react-router";

import { CollectionExperience } from "@/components/CollectionExperience";
import { getCollection } from "@/data/collections";
import { collectionHead } from "@/lib/productSeo";

const collection = getCollection("makhmal")!;

export const Route = createFileRoute("/collections/makhmal")({
  head: () => collectionHead(collection),
  component: MakhmalPage,
});

function MakhmalPage() {
  return <CollectionExperience collection={collection} />;
}
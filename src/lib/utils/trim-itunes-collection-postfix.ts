export function trimItunesCollectionPostfix(collectionName: string) {
  return collectionName.replace(" - Single", "").replace(" - EP", "");
}

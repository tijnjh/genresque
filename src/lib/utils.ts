export function genreNameToSlug(genre: string) {
  return genre.replace(/[^a-z0-9]/gi, "");
}

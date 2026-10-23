import { everynoiseUrl } from "./constants";

export function genreNameToSlug(genre: string) {
  return genre.replace(/[^a-z0-9]/gi, "");
}

export function fixRelativeUrl(url: string) {
  if (url.startsWith("http")) return url;
  return everynoiseUrl + url;
}

export function tryInferGenreSlugFromName(genreName: string) {
  return genreName.replace(/[^a-zA-Z]/g, "");
}

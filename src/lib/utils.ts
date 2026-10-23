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

export function findSoundOfPlaylistId(
  links: Array<{ text: string; href: string }>,
) {
  const fullUrl = links.find((l) => l.text === "playlist")?.href;
  if (!fullUrl) return;
  return fullUrl.replace("https://open.spotify.com/playlist/", "");
}

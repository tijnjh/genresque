import { everynoiseUrl } from "./constants";

export function genreNameToSlug(genre: string) {
  return genre.replace(/[^a-z0-9]/gi, "");
}

export function fixRelativeUrl(url: string) {
  if (url.startsWith("http")) return url;
  return everynoiseUrl + url;
}

export function findSoundOfPlaylistId(
  links: Array<{ text: string; href: string }>,
) {
  const fullUrl = links.find((l) => l.text === "playlist")?.href;
  if (!fullUrl) return;
  return fullUrl.replace("https://open.spotify.com/playlist/", "");
}

export function fmt(
  as: "date",
  subject: Date,
  opts?: Intl.DateTimeFormatOptions,
): string;
export function fmt(
  as: "number",
  subject: number,
  opts?: Intl.NumberFormatOptions,
): string;
export function fmt(
  as: "number" | "date",
  subject: number | Date,
  opts?: object,
): string {
  const locale = "en";

  switch (as) {
    case "date":
      return Intl.DateTimeFormat(locale, opts).format(subject);

    case "number":
      return Intl.NumberFormat(locale, opts).format(subject as number);
  }
}

export function getErrorMessage(error: unknown) {
  const genericMsg = "an unknown error occurred, check logs for more info";

  switch (typeof error) {
    case "undefined":
      return genericMsg;

    case "string":
      return error;

    case "object":
      if (error === null) return genericMsg;
      if ("message" in error) return error.message as string;
      return JSON.stringify(error);

    default:
      return genericMsg;
  }
}

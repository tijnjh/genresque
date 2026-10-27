import { createServerFn } from "@tanstack/solid-start";
import * as itunes from "itunes-store-api";
import * as v from "valibot";

export const itunes_getArtistAlbums = createServerFn({ method: "GET" })
  .validator(v.string())
  .handler(async ({ data: artistName }) => {
    const artists = await itunes
      .search(artistName, {
        media: "music",
        entity: "musicArtist",
      })
      .then((response) => response.results);
    const artistId = artists.find(
      (artist) => artist.artistName.toLowerCase() === artistName.toLowerCase(),
    )?.artistId;

    if (!artistId)
      return {
        artistId,
        albums: [],
      };

    const albums = await itunes
      .lookup("id", artistId, {
        media: "music",
        entity: "album",
      })
      .then((response) =>
        response.results.filter(
          (result): result is itunes.ResultAlbum =>
            result.wrapperType === "collection",
        ),
      );

    return { artistId, albums };
  });

import { $itunes } from "./clients/itunes";
import { $lastFm, getLastFmAlbumTags } from "./clients/last-fm";
import { createServerFn } from "@tanstack/solid-start";
import * as itunes from "itunes-store-api";
import * as v from "valibot";

export const getAlbum = createServerFn({ method: "GET" })
  .validator(v.number())
  .handler(async ({ data: id }) => {
    const response = await $itunes.lookup("id", id, {
      media: "music",
      entity: "song",
    });

    // for some reason the first result of a song query on an album returns the album itself..
    // weird but not complaining since it saves us a request :)
    const album = response.results[0] as unknown as itunes.ResultAlbum;
    if (album.collectionType !== "Album") return null;

    const tracks = response.results.filter((r) => r.wrapperType === "track");

    const tags = await getLastFmAlbumTags({
      data: {
        artist: album.artistName,
        album: album.collectionName,
      },
    });

    return { album, tracks, tags };
  });

export const getArtistAlbums = createServerFn({ method: "GET" })
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

    if (!artistId) return [];

    return itunes
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
  });

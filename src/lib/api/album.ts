import { createServerFn } from "@tanstack/solid-start";
import * as itunes from "itunes-store-api";
import { $itunes } from "./clients/itunes";
import * as v from "valibot";

export const getAlbum = createServerFn({ method: "GET" })
  .validator(v.number())
  .handler(async ({ data: id }) => {
    const response = await $itunes.lookup("id", id, {
      media: "music",
      entity: "song",
    });

    const results: Array<itunes.ResultAlbum | itunes.ResultMusicTrack> = response.results;

    const album = results.find(
      (result): result is itunes.ResultAlbum => result.wrapperType === "collection",
    );
    if (!album) return null;

    const tracks = results.filter(
      (result): result is itunes.ResultMusicTrack =>
        result.wrapperType === "track" && result.kind === "song",
    );

    return { album, tracks };
  });

export const getArtistAlbums = createServerFn({ method: "GET" })
  .validator(v.string())
  .handler(async ({ data: artistName }) => {
    const artists = await itunes.search(artistName, {
      media: "music",
      entity: "musicArtist",
    }).then((response) => response.results);
    const artistId = artists.find(
      (artist) => artist.artistName.toLowerCase() === artistName.toLowerCase(),
    )?.artistId;

    if (!artistId) return [];

    return itunes.lookup("id", artistId, {
      media: "music",
      entity: "album",
    }).then((response) =>
      response.results.filter(
        (result): result is itunes.ResultAlbum => result.wrapperType === "collection",
      ),
    );
  });

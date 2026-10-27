import { everynoiseUrl } from "../constants";
import { Scrappy } from "../scrappy";
import { getAllGenres_serverOnly } from "../server-only";
import { genreNameToSlug } from "../utils";
import { $spotify } from "./clients/spotify";
import { createServerFn } from "@tanstack/solid-start";
import ky from "ky";
import * as v from "valibot";

export const getAllGenres = createServerFn().handler(getAllGenres_serverOnly);

export const getGenreDetails = createServerFn()
  .validator(v.string())
  .handler(async ({ data }) => {
    const genreSlug = genreNameToSlug(data);

    const scrappy = await Scrappy.init(
      `${everynoiseUrl}/engenremap-${genreSlug}.html`,
    );

    const titleEl = scrappy.find(".title");

    const genreName = scrappy
      .find(".title")
      ?.el.childNodes[1].textContent?.slice(3, -3);

    const artists = scrappy
      .find(".canvas")
      ?.findAll(".genre")
      .map((el) => ({
        artistName: el.childNodes[0].textContent,
        id: el.querySelector<HTMLAnchorElement>("a")?.href?.slice(23),
        color: el.style.getPropertyValue("color"),
        previewUrl: el.getAttribute("preview_url"),
        previewTitle: el.getAttribute("title"),
      }));

    const links = titleEl?.findAll<HTMLAnchorElement>("a").map((e) => ({
      text: e.textContent,
      href: e.href,
    }));

    const relatedGenres = scrappy
      .find("#tunnel")
      ?.find(".canvas")
      ?.findAll(".genre")
      .map((el) => ({
        genreName: el.childNodes[0].textContent!,
        color: el.style.getPropertyValue("color"),
        previewUrl: el.getAttribute("preview_url"),
        previewTitle: el.getAttribute("title"),
      }))
      .filter((g) => g.genreName !== genreName);

    return { genreName, artists, links, relatedGenres };
  });

export const getGenresByArtistId = createServerFn()
  .validator(v.string())
  .handler(async ({ data }) => {
    const res = await ky
      .get(`${everynoiseUrl}/api/${data}`)
      .text()
      .then(JSON.parse);

    return (Object.values(res)[0] as string[]) ?? [];
  });

export const lookupArtists = createServerFn()
  .validator(v.string())
  .handler(async ({ data }) => {
    const spotifyRes = await $spotify("/search", {
      searchParams: {
        type: "artist",
        q: data,
        limit: 50,
      },
    }).json(
      v.object({
        artists: v.object({
          items: v.array(
            v.object({
              name: v.string(),
              id: v.string(),
              images: v.array(
                v.object({
                  url: v.string(),
                }),
              ),
            }),
          ),
        }),
      }),
    );

    // filter out low quality "artists"
    const filteredArtists = spotifyRes.artists.items.filter(
      (i) => !!i.images.length,
    );

    return filteredArtists;
  });

export const getArtistDetailsById = createServerFn()
  .validator(v.string())
  .handler(async ({ data }) => {
    const res = await $spotify(`artists/${data}`).json(
      v.object({
        name: v.string(),
        followers: v.object({
          total: v.number(),
        }),
        id: v.string(),
      }),
    );

    return res;
  });

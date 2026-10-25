import genres from "../../data/genres.gen.json" with { type: "json" };
import { everynoiseUrl } from "../constants";
import { Scrappy } from "../scrappy";
import { genreNameToSlug } from "../utils";
import { $spotify } from "./clients";
import { createServerFn } from "@tanstack/react-start";
import * as itunes from "itunes-store-api";
import ky from "ky";
import * as v from "valibot";

export const getAllGenres = createServerFn().handler(() => genres);

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
        preview: {
          url: el.getAttribute("preview_url"),
          title: el.getAttribute("title"),
        },
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
        preview: {
          url: el.getAttribute("preview_url"),
          title: el.getAttribute("title"),
        },
      }))
      .filter((g) => g.genreName !== genreName);

    return { genreName, artists, links, relatedGenres };
  });

export const lookup = createServerFn()
  .validator(v.string())
  .handler(async ({ data }) => {
    const scrappy = await Scrappy.init(
      `${everynoiseUrl}/lookup.cgi?who=${data}`,
    );

    console.log(scrappy.find("body"));
  });

export const getGenresByArtistId = createServerFn()
  .validator(v.string())
  .handler(async ({ data }) => {
    const res = await ky
      .get(`${everynoiseUrl}/api/${data}`)
      .text()
      .then(JSON.parse);

    return (
      (Object.values(res)[0] as string[])?.map((g) => ({
        name: g,
        slug: genreNameToSlug(g),
      })) ?? []
    );
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

// i wanted to fetch these client side but apple added some crazy redirect stuff with this api on on ios so i have to do it server side sadly
// maybe make it conditional based on the platform at some point

export const proxyItunesLookup = createServerFn()
  .validator(
    v.object({
      type: v.picklist([
        "amgAlbumId",
        "amgArtistId",
        "amgVideoId",
        "id",
        "isbn",
        "upc",
        "url",
      ]),
      query: v.union([v.string(), v.number()]),
      options: v.record(v.string(), v.string()),
    }),
  )
  .handler(async ({ data }) => {
    // @ts-expect-error it has some crazy signature which im lowkey not going to recreate
    return await itunes.lookup(data.type, data.query, data.options);
  });

export const proxyItunesSearch = createServerFn()
  .validator(
    v.object({
      query: v.string(),
      options: v.record(v.string(), v.string()),
    }),
  )
  .handler(async ({ data }) => {
    return await itunes.search(data.query, data.options);
  });

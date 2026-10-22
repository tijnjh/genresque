import { createServerFn } from "@tanstack/react-start";
import { Scrappy } from "./scrappy";
import genres from "../data/genres.json" with { type: "json" };

export const getAllGenres = createServerFn().handler(() => {
  return genres;
});

import * as v from "valibot";
import { genreNameToSlug } from "./utils";

export const getGenreDetails = createServerFn()
  .validator(v.string())
  .handler(async ({ data }) => {
    const genreSlug = genreNameToSlug(data);
    // const html = await ky.get().text();
    // const dom = createDocument(html);
    // const canvasEl = dom.querySelector('.canvas');

    const scrappy = await Scrappy.init(
      `https://everynoise.com/engenremap-${genreSlug}.html`,
    );

    const artists = scrappy
      .find(".canvas")
      ?.findAll(".genre")
      .map((a) => ({
        artistName: a.childNodes[0].textContent,
        fontSize: a.style.getPropertyValue("font-size"),
      }));

    const links = scrappy
      .find(".title")
      ?.findAll<HTMLAnchorElement>("a")
      .map((e) => ({
        text: e.textContent,
        href: e.href,
      }));

    return { artists, links };
  });

import { createServerFn } from "@tanstack/react-start";
import { Scrappy } from "./scrappy";

let cachedAllGenres: undefined | object;

export const getAllGenres = createServerFn().handler(async () => {
  const scrappy = await Scrappy.init("http://localhost:5173/everynoise.html");

  if (!cachedAllGenres) {
    cachedAllGenres = scrappy.findAll(".genre").map((g) => ({
      name: g.childNodes[0].textContent!,
      preview: {
        title: g.getAttribute("title") ?? undefined,
        url: g.getAttribute("preview_url") ?? undefined,
      },
    }));
  }

  return cachedAllGenres;
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

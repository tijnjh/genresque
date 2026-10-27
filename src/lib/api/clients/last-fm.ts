import { Scrappy } from "../../scrappy";
import { isValidGenre } from "../../server-only";
import { createServerFn } from "@tanstack/solid-start";
import ky from "ky";
import * as v from "valibot";

export const $lastFm = ky.create({
  baseUrl: "https://last.fm",
});

const baseUrl = "https://last.fm";

export const getLastFmAlbumTags = createServerFn()
  .validator(
    v.object({
      artist: v.string(),
      album: v.string(),
    }),
  )
  .handler(async ({ data }) => {
    const scrappy = await Scrappy.init(
      `${baseUrl}/music/${data.artist}/${data.album}`,
    );

    const tagEls = scrappy.find(".catalogue-tags")?.findAll(".tag");

    const tags = tagEls?.map((el) => el.textContent) ?? [];

    console.log({ tagsfromremotefunctionthing: tags });
    return tags.filter(isValidGenre);
  });

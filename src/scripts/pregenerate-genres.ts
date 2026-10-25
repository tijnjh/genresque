import { Scrappy } from "../lib/scrappy.ts";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { cwd } from "node:process";

const everynoiseHtml = await readFile(
  path.join(cwd(), "src", "data", "everynoise.html"),
  "utf-8",
);

const scrappy = await Scrappy.init({ raw: everynoiseHtml });

const genres = scrappy.findAll(".genre").map((g) => ({
  name: g.childNodes[0].textContent!,
  slug: g.querySelector("a")?.href.slice(12, -5),
  color: g.style.getPropertyValue("color"),
  preview: {
    title: g.getAttribute("title") ?? undefined,
    url: g.getAttribute("preview_url") ?? undefined,
  },
}));

await writeFile(
  path.join(cwd(), "src", "data", "genres.gen.json"),
  JSON.stringify(genres),
);

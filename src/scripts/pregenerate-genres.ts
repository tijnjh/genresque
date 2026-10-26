import everynoiseHtml from "../data/everynoise.html?raw";
import { Scrappy } from "../lib/scrappy.ts";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { cwd } from "node:process";
import * as CSV from "papaparse";

const scrappy = await Scrappy.init({ raw: everynoiseHtml });

const genres = scrappy.findAll(".genre").map((g) => ({
  genreName: g.childNodes[0].textContent!,
  color: g.style.getPropertyValue("color"),
  previewTitle: g.getAttribute("title") ?? undefined,
  previewUrl: g.getAttribute("preview_url") ?? undefined,
}));

await writeFile(
  path.join(cwd(), "src", "data", "genres.gen.csv"),
  CSV.unparse(genres),
);

import { everynoiseUrl } from "../../constants";
import ky from "ky";

export const $everynoise = ky.create({
  baseUrl: everynoiseUrl,
});

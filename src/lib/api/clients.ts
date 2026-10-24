import { everynoiseUrl } from "../constants";
import { obtainSpotifyToken } from "./spotify-token";
import ky from "ky";

export const $everynoise = ky.create({
  baseUrl: everynoiseUrl,
});

const spotifyToken = await obtainSpotifyToken();

export const $spotify = ky.create({
  baseUrl: "https://api.spotify.com",
  prefix: "v1",
  headers: {
    Authorization: `Bearer ${spotifyToken}`,
  },
});

import { obtainSpotifyToken } from "../spotify-token";
import ky from "ky";

export const $spotify = ky.create({
  baseUrl: "https://api.spotify.com",
  prefix: "v1",
  hooks: {
    beforeRequest: [
      async ({ request }) => {
        request.headers.set(
          "Authorization",
          `Bearer ${await obtainSpotifyToken()}`,
        );
      },
    ],
  },
});

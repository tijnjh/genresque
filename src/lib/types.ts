import { getAllGenres } from "./server-functions";

declare global {
  namespace enoa {
    type Genre = Awaited<ReturnType<typeof getAllGenres>>[number];
  }
}

import { getAllGenres } from "./api/server-functions";

declare global {
  namespace Everynoise {
    type Genre = Awaited<ReturnType<typeof getAllGenres>>[number];
  }
}

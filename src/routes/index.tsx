import { getAllGenres } from "../lib/server-functions";
import { createFileRoute } from "@tanstack/react-router";
import { memo, useEffect, useRef } from "react";
import { useGenreTickers } from "../hooks/use-genre-tickers";
import { useVirtualizer } from "@tanstack/react-virtual";
import { GenreGrid } from "../components/genre-grid";

export const Route = createFileRoute("/")({
  component: RouteComponent,
  loader: async () => {
    const genres = await getAllGenres();
    return { genres };
  },
});

function RouteComponent() {
  const { genres } = Route.useLoaderData();
  return <GenreGrid genres={genres} />;
}

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
  const gridRef = useGenreTickers(genres);

  useEffect(() => {
    // @ts-expect-error dey no have types
    import("interestfor");
  }, []);

  const parentRef = useRef(null);

  const rowVirtualizer = useVirtualizer({
    count: genres.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
    lanes: 6,
  });

  return <GenreGrid genres={genres} />;
}

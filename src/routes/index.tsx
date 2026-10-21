import { getAllGenres } from "../lib/server-functions";
import { createFileRoute } from "@tanstack/react-router";
import { memo, useEffect } from "react";
import { useGenreTickers } from "../hooks/use-genre-tickers";

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

  return (
    <>
      {/* need a nice way to sync up search value with queryparam */}
      {/* <div className="col-span-full grid grid-cols-subgrid">
        <input
          // value={searchParams.q}
          className="col-span-full thing w-full md:col-[2/-2] md:my-9"
          placeholder="filter genres"
        /> 
      </div> */}

      <ul ref={gridRef}>
        {genres.map(
          (genre) => genre && <GenreTicker key={genre.name} genre={genre} />,
        )}
      </ul>
    </>
  );
}

const GenreTicker = memo(function GenreTicker({
  genre,
}: {
  genre: enoa.Genre;
}) {
  const uid = genre.slug; // replace with genreSlug at some point

  return (
    <li className="min-w-0">
      <button
        // @ts-expect-error react being outdated
        interestfor={`${uid}-popover`}
        style={{
          anchorName: `--${uid}`,
        }}
        className="w-full [--interest-delay:0ms] [interest-delay:0ms]"
      >
        <span
          data-genre-label
          className="group/ticker block min-w-0 w-full overflow-hidden text-left contain-[inline-size_paint]"
        >
          <span className="relative block w-max whitespace-nowrap motion-safe:group-[[data-overflow][data-visible]]/ticker:animate-genre-ticker">
            {genre.name}
            <span
              className="absolute top-0 left-[calc(100%+24px)] hidden group-[[data-overflow][data-visible]]/ticker:block"
              aria-hidden="true"
            >
              {genre.name}
            </span>
          </span>
        </span>
      </button>

      <div
        id={`${uid}-popover`}
        popover=""
        style={{
          positionAnchor: `--${uid}`,
          positionArea: "bottom span-right",
          positionTryFallbacks:
            "flip-block, flip-inline, flip-block flip-inline",
          width: `calc(anchor-size(--${uid} width) * 3)`,
          height: `calc(anchor-size(--${uid} height) * 5)`,
          maxWidth: "calc(100vw - 16px)",
          maxHeight: "calc(100dvh - 16px)",
        }}
        className="fixed border border-zinc-200"
      >
        <div className="flex size-full p-4 gap-4 flex-col justify-center">
          <span className="text-balance">{genre.preview.title}</span>
          <audio src={genre.preview.url} controls preload="none"></audio>
        </div>
      </div>
    </li>
  );
});

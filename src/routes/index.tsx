import { AsyncView } from "../components/async-view";
import { Header } from "../components/header";
import { PlayButton } from "../components/play-button";
import { VirtualGrid } from "../components/virtual-grid";
import { useEnumToggle } from "../hooks/use-enum-toggle";
import { useGenreTickers } from "../hooks/use-genre-tickers";
import { getAllGenres } from "../lib/server-functions";
import { Button, Input } from "@base-ui/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryState } from "nuqs";
import { useMemo } from "react";

export const Route = createFileRoute("/")({ component: RouteComponent });

function RouteComponent() {
  const genresQuery = useQuery({
    queryKey: ["genres"],
    queryFn: async () => await getAllGenres(),
  });

  const [searchTerm, setSearchTerm] = useQueryState("q", {
    clearOnDefault: true,
    defaultValue: "",
  });

  const [type, setType] = useQueryState("type", {
    clearOnDefault: true,
    defaultValue: "genre",
  });

  // implement lookup after i figure out how to get the slug from the artist id without fetching spotify
  const filterType = useEnumToggle(["genre", /* "lookup",*/ "preview"], {
    onUpdate: setType,
    defaultValue: type ?? "genre",
  });

  return (
    <>
      <Header title="genresque">
        <div className="flex grow gap-3 pr-3 md:max-w-md">
          <Input
            value={searchTerm ?? ""}
            onValueChange={(val) => setSearchTerm(val)}
            className="h-9 min-w-0 grow bg-white px-3"
          />

          <Button className="btn" onClick={filterType.cycle}>
            {filterType.current}
          </Button>

          <Button className="btn-inverse size-9 justify-center">→</Button>
        </div>
      </Header>

      <AsyncView query={genresQuery}>
        {(genres) => {
          return (
            <Genres
              filterType={filterType.current}
              searchTerm={searchTerm}
              genres={genres}
            />
          );
        }}
      </AsyncView>
    </>
  );
}

function Genres({
  genres,
  searchTerm,
  filterType,
}: {
  genres: enoa.Genre[];
  searchTerm: string;
  filterType: string;
}) {
  const filteredGenres = useMemo(() => {
    const t = searchTerm?.toLowerCase();

    switch (filterType) {
      case "genre":
        return t
          ? genres.filter((g) => g.name.toLowerCase().includes(t))
          : genres;

      case "preview":
        return t
          ? genres.filter((g) => g.preview.title.toLowerCase().includes(t))
          : genres;

      default:
        return undefined!; // trust me bro its exhaustive;
    }
  }, [searchTerm, filterType, genres]);

  const gridRef = useGenreTickers(genres);

  return (
    <VirtualGrid entries={filteredGenres} gridRef={gridRef}>
      {(genre) => <GenreTicker genre={genre} />}
    </VirtualGrid>
  );
}

function GenreTicker({ genre }: { genre: enoa.Genre }) {
  // the marquee string and the normal one have to be the exact same width otherwise it will glitch ;-;
  const PaddedStr = () => <span className="px-3">{genre.name}</span>;

  return (
    <div className="flex items-center">
      <Link
        to="/genre/$slug"
        params={{ slug: genre.slug }}
        data-genre-label
        className="group/ticker flex h-9 w-full min-w-0 items-center overflow-hidden bg-white text-left contain-[inline-size_paint] hover:bg-zinc-100 hover:underline"
      >
        <span className="relative block w-max whitespace-nowrap motion-safe:group-[[data-overflow][data-visible]]/ticker:animate-genre-ticker">
          <PaddedStr />
          <span
            className="absolute top-0 left-[calc(100%+24px)] hidden group-[[data-overflow][data-visible]]/ticker:block"
            aria-hidden="true"
          >
            <PaddedStr />
          </span>
        </span>
      </Link>

      <PlayButton
        title={genre.preview.title}
        className="btn-inverse size-9 shrink-0 justify-center"
        track={genre.preview}
      />
    </div>
  );
}

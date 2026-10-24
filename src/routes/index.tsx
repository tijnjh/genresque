import { AsyncView } from "../components/async-view";
import { Chip } from "../components/chip";
import { Header } from "../components/header";
import { Main } from "../components/main";
import { PlayButton } from "../components/play-button";
import { VirtualGrid } from "../components/virtual-grid";
import { useEnumToggle } from "../hooks/use-enum-toggle";
import { getAllGenres } from "../lib/api/server-functions";
import { Button, Input } from "@base-ui/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
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

  const filterType = useEnumToggle(["genre", "preview", "lookup"], {
    onUpdate: setType,
    defaultValue: type ?? "genre",
  });

  return (
    <>
      <Header title="genresque">
        <form
          className="flex grow gap-3 px-3 md:max-w-md"
          action="/lookup"
          onSubmit={(e) => {
            if (!searchTerm.trim()) e.preventDefault();
            if (filterType.current !== "lookup") e.preventDefault();
          }}
        >
          <Button className="btn" onClick={filterType.cycle}>
            {filterType.current}
          </Button>

          <Input
            value={searchTerm ?? ""}
            onValueChange={(val) => setSearchTerm(val)}
            className="h-9 min-w-0 grow bg-zinc-50-950 px-3"
            name="q"
            placeholder={
              {
                genre: "filter genre names",
                preview: "filter genre preview track name",
                lookup: "look up an artist",
              }[filterType.current]
            }
          />

          {filterType.current === "lookup" && (
            <Button type="submit" className="btn-inverse size-9 justify-center">
              →
            </Button>
          )}
        </form>
      </Header>

      <AsyncView query={genresQuery}>
        {(genres) => {
          return (
            <Main>
              <Genres
                filterType={filterType.current}
                searchTerm={searchTerm}
                genres={genres}
              />
            </Main>
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
  genres: Everynoise.Genre[];
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
        return [];
    }
  }, [searchTerm, filterType, genres]);

  return (
    <VirtualGrid entries={filteredGenres}>
      {(genre) => (
        <Chip
          to="/genre/$slug"
          params={{ slug: genre.slug }}
          trailing={
            <PlayButton
              title={genre.preview.title}
              className="btn-inverse size-9 shrink-0 justify-center"
              track={genre.preview}
            />
          }
        >
          {genre.name}
        </Chip>
      )}
    </VirtualGrid>
  );
}

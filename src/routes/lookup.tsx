import { AsyncView } from "../components/async-view";
import { Chip } from "../components/chip";
import { Header } from "../components/header";
import { Main } from "../components/main";
import { VirtualGrid } from "../components/virtual-grid";
import { lookupArtists } from "../lib/api/server-functions";
import { Button, Input } from "@base-ui/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import * as v from "valibot";

export const Route = createFileRoute("/lookup")({
  validateSearch: v.object({
    q: v.string(),
    // like googles "feeling lucky" button it will auto open the first result
    lucky: v.optional(v.boolean()),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { q, lucky } = Route.useSearch();

  const artistsQuery = useQuery({
    queryKey: ["lookup-artists", q],
    queryFn: async () => lookupArtists({ data: q }),
  });

  const navigate = Route.useNavigate();

  // scuffed asl
  if (lucky) {
    if (!artistsQuery.data?.length) {
      return;
    } else {
      navigate({
        to: "/artist/$id",
        params: { id: artistsQuery.data[0].id },
        replace: true,
      });
    }
  }

  const [searchTerm, setSearchTerm] = useState(q);

  return (
    <>
      <Header title="artist lookup" backHref="/">
        <form className="flex grow gap-3 px-3 md:max-w-md" action="/lookup">
          <Input
            className="h-9 min-w-0 grow bg-zinc-50-950 px-3"
            name="q"
            value={searchTerm}
            onValueChange={setSearchTerm}
          />

          <Button type="submit" className="btn-inverse size-9 justify-center">
            →
          </Button>
        </form>
      </Header>

      <Main>
        <AsyncView query={artistsQuery}>
          {(results) => (
            <VirtualGrid entries={results}>
              {(artist) => (
                <Chip
                  to="/artist/$id"
                  leading={
                    <img src={artist.images.at(-1)?.url} className="size-9" />
                  }
                  params={{ id: artist.id }}
                >
                  {artist.name}
                </Chip>
              )}
            </VirtualGrid>
          )}
        </AsyncView>
      </Main>
    </>
  );
}

import { AsyncView } from "../components/async-view";
import { Chip } from "../components/chip";
import { Layout } from "../components/layout";
import { lookupArtists } from "../lib/api/server-functions";
import { Button, Input } from "@base-ui/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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

  const [searchTerm, setSearchTerm] = useState(q);

  // scuffed asl
  if (lucky) {
    if (!artistsQuery.data?.length) {
      return <div />;
    } else {
      navigate({
        to: "/artist/$id",
        params: { id: artistsQuery.data[0].id },
        replace: true,
      });
    }
  }

  return (
    <>
      <Layout
        header={{
          title: "artist lookup",
          children: (
            <form className="flex grow gap-3 px-3 md:max-w-md" action="/lookup">
              <Input
                className="h-9 min-w-0 grow bg-zinc-50-950 px-3"
                name="q"
                value={searchTerm}
                onValueChange={setSearchTerm}
              />

              <Button
                type="submit"
                className="btn-inverse size-9 justify-center"
              >
                →
              </Button>
            </form>
          ),
        }}
      >
        <AsyncView query={artistsQuery}>
          {(results) => (
            <div className="cool-grid">
              {results.map((artist) => (
                <Chip
                  key={artist.id}
                  to="/artist/$id"
                  leading={artist.images.at(-1)?.url}
                  params={{ id: artist.id }}
                >
                  {artist.name}
                </Chip>
              ))}
            </div>
          )}
        </AsyncView>
      </Layout>
    </>
  );
}

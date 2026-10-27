import { AsyncView } from "../components/async-view";
import { Chip } from "../components/chip";
import { Layout } from "../components/layout";
import { lookupArtists } from "../lib/api/server-functions";
import { useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  LinkOptions,
  linkOptions,
} from "@tanstack/react-router";
import { useState } from "react";
import * as v from "valibot";

let x: LinkOptions = { to: "/album/$itunesId", params: {} };

export const Route = createFileRoute("/search")({
  validateSearch: v.object({
    q: v.optional(v.string()),
    // like googles "feeling lucky" button it will auto open the first result
    lucky: v.optional(v.boolean()),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { q, lucky } = Route.useSearch();

  const artistsQuery = useQuery({
    queryKey: ["lookup-artists", q],
    queryFn: async () => lookupArtists({ data: q! }),
    enabled: !!q,
  });

  const navigate = Route.useNavigate();

  const [searchQuery, setSearchQuery] = useState<string>();

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
    <Layout
      header={{
        title: "search",
        children: (
          <form
            className="flex grow gap-3 md:max-w-md"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({
                to: "/search",
                search: {
                  q: searchQuery,
                },
              });
            }}
          >
            <input
              value={searchQuery ?? ""}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              className="h-9 min-w-0 grow bg-zinc-50-950 px-3"
              name="q"
              placeholder="look up an artist"
            />

            <button type="submit" className="btn-inverse size-9 justify-center">
              →
            </button>
          </form>
        ),
      }}
    >
      {q && (
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
      )}
    </Layout>
  );
}

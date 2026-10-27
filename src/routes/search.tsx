import { AsyncView } from "../components/async-view";
import { Chip } from "../components/chip";
import { Layout } from "../components/layout";
import { lookupArtists } from "../lib/api/server-functions";
import { useQuery } from "@tanstack/solid-query";
import { createFileRoute } from "@tanstack/solid-router";
import { createEffect, createSignal, For, Show } from "solid-js";
import * as v from "valibot";

export const Route = createFileRoute("/search")({
  validateSearch: v.object({
    q: v.optional(v.string()),
    // like googles "feeling lucky" button it will auto open the first result
    lucky: v.optional(v.boolean()),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useSearch();

  const artistsQuery = useQuery(() => ({
    queryKey: ["lookup-artists", params().q],
    queryFn: async () => lookupArtists({ data: params().q! }),
    enabled: !!params().q,
  }));

  const navigate = Route.useNavigate();

  const [searchQuery, setSearchQuery] = createSignal<string>();

  createEffect(
    () =>
      params().lucky && artistsQuery.isSuccess
        ? artistsQuery.data[0]?.id
        : undefined,
    (id) => {
      if (id) {
        navigate({
          to: "/artist/$id",
          params: { id },
          replace: true,
        });
      }
    },
  );

  return (
    <Layout
      header={{
        title: "search",
        children: (
          <form
            class="flex grow gap-3 md:max-w-md"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({
                to: "/search",
                search: {
                  q: searchQuery(),
                },
              });
            }}
          >
            <input
              value={searchQuery() ?? ""}
              onInput={(e) => setSearchQuery(e.currentTarget.value)}
              class="h-9 min-w-0 grow bg-zinc-50-950 px-3"
              name="q"
              placeholder="look up an artist"
            />

            <button type="submit" class="btn-inverse size-9 justify-center">
              →
            </button>
          </form>
        ),
      }}
    >
      <Show when={params().q}>
        <AsyncView query={artistsQuery}>
          {(results) => (
            <div class="cool-grid h-full p-3">
              <For each={results}>
                {(artist) => (
                  <Chip
                    // key={artist.id}
                    to="/artist/$id"
                    leading={artist.images.at(-1)?.url}
                    params={{ id: artist.id }}
                  >
                    {artist.name}
                  </Chip>
                )}
              </For>
            </div>
          )}
        </AsyncView>
      </Show>
    </Layout>
  );
}

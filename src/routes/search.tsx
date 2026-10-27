import { Chip } from "../components/chip";
import { Layout } from "../components/layout";
import { lookupArtists } from "../lib/api/server-functions";
import { siteName } from "../lib/constants";
import { createFileRoute } from "@tanstack/solid-router";
import { createSignal, For, onSettled, Show } from "solid-js";
import * as v from "valibot";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: `Search artists | ${siteName}` },
      { name: "robots", content: "noindex,follow" },
    ],
  }),
  validateSearch: v.object({
    q: v.optional(v.string()),
    // like googles "feeling lucky" button it will auto open the first result
    lucky: v.optional(v.boolean()),
  }),

  loaderDeps: ({ search }) => ({ search }),

  loader: async ({ deps: { search } }) => {
    if (!search.q) return;
    const artists = await lookupArtists({ data: search.q });
    return { artists };
  },

  component: RouteComponent,
});

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const data = Route.useLoaderData();

  const [searchTerm, setSearchTerm] = createSignal<string>();

  onSettled(() => {
    if (!search().lucky) return;

    const topResultId = data()?.artists[0].id;

    navigate({
      to: "/artist/$id",
      params: { id: topResultId! },
      replace: true,
    });
  });

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
                  q: searchTerm(),
                },
              });
            }}
          >
            <input
              value={searchTerm() ?? ""}
              onInput={(e) => setSearchTerm(e.currentTarget.value)}
              required
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
      <Show when={search().q}>
        <div class="cool-grid h-full p-3">
          <For each={data()?.artists}>
            {(artist) => (
              <Chip
                to="/artist/$id"
                leading={artist.images.at(-1)?.url}
                params={{ id: artist.id }}
              >
                {artist.name}
              </Chip>
            )}
          </For>
        </div>
      </Show>
    </Layout>
  );
}

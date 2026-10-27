import { AsyncView } from "../components/async-view";
import { Chip } from "../components/chip";
import { Layout } from "../components/layout";
import { PlayButton } from "../components/play-button";
import { SpotifyWidget } from "../components/spotify-widget";
import { getGenreDetails } from "../lib/api/server-functions";
import { findSoundOfPlaylistId, genreNameToSlug } from "../lib/utils";
import { useQuery } from "@tanstack/solid-query";
import { createFileRoute } from "@tanstack/solid-router";
import { For, Show } from "solid-js";

export const Route = createFileRoute("/genre/$slug")({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();

  const genreDetailsQuery = useQuery(() => ({
    queryKey: ["genre-details", params().slug],
    queryFn: async () => await getGenreDetails({ data: params().slug }),
  }));

  return (
    <Layout
      header={{ title: genreDetailsQuery.data?.genreName ?? params().slug }}
      leading={
        <Show when={genreDetailsQuery.isSuccess}>
          <SpotifyWidget
            id={findSoundOfPlaylistId(genreDetailsQuery.data!.links!)!}
            type="playlist"
          />

          <span class="section-divider">related genres</span>

          <div class="cool-grid">
            <For each={genreDetailsQuery.data!.relatedGenres}>
              {(genre) => (
                <Chip
                  to="/genre/$slug"
                  params={{ slug: genreNameToSlug(genre.genreName) }}
                  trailing={
                    <PlayButton
                      title={genre.previewTitle!}
                      class="bt size-9 shrink-0 justify-center"
                      style={{ "background-color": genre.color }}
                      track={{
                        title: genre.previewTitle ?? undefined,
                        url: genre.previewUrl ?? undefined,
                      }}
                    />
                  }
                >
                  {genre.genreName}
                </Chip>
              )}
            </For>
          </div>
        </Show>
      }
      trailing={
        <AsyncView query={genreDetailsQuery}>
          {(genre) => (
            <div class="flex flex-col gap-3 lg:overflow-y-auto">
              <span class="section-divider">artists in this genre</span>

              <div class="grid grid-cols-responsive gap-3">
                <For each={genre.artists}>
                  {(artist) => (
                    <Chip
                      to="/artist/$id"
                      params={{ id: artist.id }}
                      trailing={
                        <PlayButton
                          class="btn size-9 justify-center"
                          style={{ "background-color": artist.color }}
                          title={artist.previewTitle!}
                          track={{
                            title: artist.previewTitle ?? undefined,
                            url: artist.previewUrl ?? undefined,
                          }}
                        />
                      }
                    >
                      {artist.artistName!}
                    </Chip>
                  )}
                </For>
              </div>
            </div>
          )}
        </AsyncView>
      }
    />
  );
}

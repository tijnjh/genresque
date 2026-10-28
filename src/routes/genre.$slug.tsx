import { Chip } from "#components/chip";
import { Layout } from "#components/layout";
import { PlayButton } from "#components/play-button";
import { SpotifyWidget } from "#components/spotify-widget";
import { $everynoise } from "#lib/api/index";
import { siteName, siteUrl } from "#lib/constants";
import { findSoundOfPlaylistId, genreNameToSlug } from "#lib/utils";
import { createFileRoute } from "@tanstack/solid-router";
import { For, Show } from "solid-js";

export const Route = createFileRoute("/genre/$slug")({
  loader: ({ params }) => $everynoise.getGenreBySlug({ data: params.slug }),
  head: ({ loaderData, params }) => ({
    meta: [
      {
        title: `${loaderData?.genreName ?? params.slug} artists | ${siteName}`,
      },
      {
        name: "description",
        content: `Explore ${loaderData?.genreName ?? params.slug} artists and related music genres on ${siteName}.`,
      },
    ],
    links: [{ rel: "canonical", href: `${siteUrl}/genre/${params.slug}` }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  const genre = Route.useLoaderData();

  return (
    <Layout
      header={{ title: genre().genreName ?? params().slug }}
      leading={
        <Show when={genre()}>
          <SpotifyWidget
            id={findSoundOfPlaylistId(genre().links!)!}
            type="playlist"
          />

          <span class="section-divider">related genres</span>

          <div class="cool-grid">
            <For each={genre().relatedGenres}>
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
        <div class="flex flex-col gap-3 lg:overflow-y-auto">
          <span class="section-divider">artists in this genre</span>

          <div class="grid grid-cols-responsive gap-3">
            <For each={genre().artists}>
              {(artist) => (
                <Chip
                  to="/artist/$spotifyId"
                  params={{ spotifyId: artist.id }}
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
      }
    />
  );
}

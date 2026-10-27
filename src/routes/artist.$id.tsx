import { AsyncView } from "../components/async-view";
import { Chip } from "../components/chip";
import { Layout } from "../components/layout";
import { SpotifyWidget } from "../components/spotify-widget";
import { getArtistAlbums } from "../lib/api/album";
import {
  getArtistDetailsById,
  getGenresByArtistId,
} from "../lib/api/server-functions";
import { siteName, siteUrl } from "../lib/constants";
import { genreNameToSlug } from "../lib/utils";
import { useQuery } from "@tanstack/solid-query";
import { createFileRoute } from "@tanstack/solid-router";
import { ResultAlbum } from "itunes-store-api";
import { For, Show } from "solid-js";

export const Route = createFileRoute("/artist/$id")({
  loader: async ({ params }) => {
    const artist = await getArtistDetailsById({ data: params.id });
    const releases = await getArtistAlbums({ data: artist.name });
    return { artist, releases };
  },
  head: ({ loaderData, params }) => ({
    meta: [
      { title: `${loaderData?.artist.name ?? "Artist"} albums | ${siteName}` },
      {
        name: "description",
        content: `Browse albums and music genres for ${loaderData?.artist.name ?? "this artist"} on ${siteName}.`,
      },
    ],
    links: [{ rel: "canonical", href: `${siteUrl}/artist/${params.id}` }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  const data = Route.useLoaderData();

  const artistGenresQuery = useQuery(() => ({
    queryKey: ["artist-genres", params().id],
    queryFn: async () => await getGenresByArtistId({ data: params().id }),
  }));

  return (
    <Layout
      header={{
        title: data().artist.name,
      }}

      leading={
        <>
          <SpotifyWidget id={params().id} type="artist" class="h-38!" />

          <AsyncView query={artistGenresQuery}>
            {(data) => (
              <Show when={data.length}>
                <span class="section-divider">genres this artist is in</span>

                <div class="cool-grid">
                  <For each={data}>
                    {(genre) => (
                      <Chip
                        to="/genre/$slug"
                        params={{ slug: genreNameToSlug(genre) }}
                      >
                        {genre}
                      </Chip>
                    )}
                  </For>
                </div>
              </Show>
            )}
          </AsyncView>
        </>
      }

      trailing={<ArtistReleasesList releases={data().releases} />}
    />
  );
}

function ArtistReleasesList(props: { releases: ResultAlbum[] }) {
  const organizedReleases = () => organizeArtistReleases(props.releases);
  return (
    <div class="lg:overflow-y-auto">
      <For each={Object.entries(organizedReleases())}>
        {([name, releases]) => (
          <Show when={releases.length}>
            <div class="flex flex-col gap-3">
              <span class="section-divider">{name}</span>

              <div class="cool-grid">
                <For each={releases}>
                  {(release) => (
                    <Chip
                      leading={release.artworkUrl60}
                      to="/album/$itunesId"
                      params={{ itunesId: String(release.collectionId) }}
                    >
                      {streamlineReleaseName(release.collectionName)}
                    </Chip>
                  )}
                </For>
              </div>
            </div>
          </Show>
        )}
      </For>
    </div>
  );
}

function organizeArtistReleases(releases: ResultAlbum[]) {
  // remove cleaned version
  releases = releases.filter((r) => r.collectionExplicitness !== "cleaned");

  const albums: ResultAlbum[] = [];
  const eps: ResultAlbum[] = [];
  const singles: ResultAlbum[] = [];

  for (const release of releases) {
    const name = release.collectionName;

    switch (true) {
      case name.endsWith(" - Single"):
        singles.push(release);
        break;

      case name.endsWith(" - EP"):
        eps.push(release);
        break;

      default:
        albums.push(release);
        break;
    }
  }

  return { albums, eps, singles };
}

function streamlineReleaseName(releaseName: string) {
  return releaseName.replace(" - Single", "").replace(" - EP", "");
}

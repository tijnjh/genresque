import { AsyncView } from "../components/async-view";
import { Chip } from "../components/chip";
import { Layout } from "../components/layout";
import { SpotifyWidget } from "../components/spotify-widget";
import { itunes } from "../lib/api/itunes";
import {
  getArtistDetailsById,
  getGenresByArtistId,
} from "../lib/api/server-functions";
import { genreNameToSlug } from "../lib/utils";
import { useQuery } from "@tanstack/solid-query";
import { createFileRoute } from "@tanstack/solid-router";
import { ResultAlbum } from "itunes-store-api";
import { For, Show } from "solid-js";

export const Route = createFileRoute("/artist/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();

  const artistDetailsQuery = useQuery(() => ({
    queryKey: ["artist-details", params().id],
    queryFn: async () => getArtistDetailsById({ data: params().id }),
  }));

  const artistGenresQuery = useQuery(() => ({
    queryKey: ["artist-genres", params().id],
    queryFn: async () => await getGenresByArtistId({ data: params().id }),
  }));

  return (
    <Layout
      header={{
        title: artistDetailsQuery.data?.name ?? "",
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

      trailing={
        <Show when={artistDetailsQuery.data?.name}>
          {(name) => <ArtistReleasesList artistName={name()} />}
        </Show>
      }
    />
  );
}

function ArtistReleasesList(props: { artistName: string }) {
  const artistAlbumsQuery = useQuery(() => ({
    queryKey: ["artist-itunes-albums", props.artistName],
    queryFn: async () => {
      const artistItunesId = await itunes
        .search(props.artistName, {
          media: "music",
          entity: "musicArtist",
        })
        .then((r) => r.results[0]?.artistId);

      if (!artistItunesId)
        throw new Error(
          `could't find id for artist: -- ${props.artistName} -- on itunes`,
        );

      return await itunes
        .lookup("id", artistItunesId, {
          media: "music",
          entity: "album",
        })
        .then((r) => r.results.filter((a) => a.wrapperType === "collection"));
    },
  }));

  return (
    <AsyncView query={artistAlbumsQuery}>
      {(releases) => {
        const organizedReleases = organizeArtistReleases(releases);

        return (
          <div class="lg:overflow-y-auto">
            <For each={Object.entries(organizedReleases)}>
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
                            params={{ itunesId: release.collectionId }}
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
      }}
    </AsyncView>
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

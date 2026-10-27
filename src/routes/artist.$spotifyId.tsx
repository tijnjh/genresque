import { Chip } from "../components/chip";
import { Layout } from "../components/layout";
import { PlatformLinks } from "../components/platform-links";
import { SpotifyWidget } from "../components/spotify-widget";
import { itunes_getArtistAlbums } from "../lib/api/album";
import {
  spotify_getArtistDetailsById,
  everynoise_getGenresByArtistId,
} from "../lib/api/server-functions";
import { siteName, siteUrl } from "../lib/constants";
import { genreNameToSlug } from "../lib/utils";
import { createFileRoute } from "@tanstack/solid-router";
import { ResultAlbum } from "itunes-store-api";
import { For, Show } from "solid-js";
import { trimItunesCollectionPostfix } from "../lib/utils/trim-itunes-collection-postfix";

export const Route = createFileRoute("/artist/$spotifyId")({
  loader: async ({ params }) => {
    const spotifyArtist = await spotify_getArtistDetailsById({
      data: params.spotifyId,
    });

    const itunesArtist = await itunes_getArtistAlbums({
      data: spotifyArtist.name,
    });

    const everynoiseGenres = await everynoise_getGenresByArtistId({
      data: params.spotifyId,
    });

    return {
      spotifyArtist,
      itunesArtist,
      everynoiseGenres,
    };
  },
  head: ({ loaderData, params }) => ({
    meta: [
      {
        title: `${loaderData?.spotifyArtist.name ?? "Artist"} albums | ${siteName}`,
      },
      {
        name: "description",
        content: `Browse albums and music genres for ${loaderData?.spotifyArtist.name ?? "this artist"} on ${siteName}.`,
      },
    ],
    links: [
      { rel: "canonical", href: `${siteUrl}/artist/${params.spotifyId}` },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  const data = Route.useLoaderData();

  return (
    <Layout
      header={{
        title: data().spotifyArtist.name,
      }}

      leading={
        <>
          <SpotifyWidget id={params().spotifyId} type="artist" class="h-38!" />

          <PlatformLinks
            links={[
              {
                name: "last.fm",
                icon: "/last-fm.ico",
                href: `https://last.fm/music/${data().spotifyArtist.name}`,
              },
              {
                name: "spotify",
                icon: "/spotify-com.png",
                href: `https://open.spotify.com/artist/${params().spotifyId}`,
              },
              {
                name: "apple music",
                icon: "/music-apple-com.png",
                href: `https://music.apple.com/artist/${data().itunesArtist.artistId}`,
              },
              {
                name: "AOTY",
                href: `https://www.albumoftheyear.org/search/artists/?q=${data().spotifyArtist.name}`,
              },
              {
                name: "bandcamp",
                icon: "/bandcamp-com.png",
                href: `https://bandcamp.com/search?q=${data().spotifyArtist.name}&item_type=b`,
              },
              {
                name: "soundcloak",
                // icon: "/sc-maid-zone.png",
                href: `https://sc.maid.zone/search?q=${data().spotifyArtist.name}&type=users`,
              },
            ]}
          />

          <Show when={data().everynoiseGenres.length}>
            <span class="section-divider">genres this artist is in</span>

            <div class="cool-grid">
              <For each={data().everynoiseGenres}>
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
        </>
      }

      trailing={<ArtistReleasesList releases={data().itunesArtist.albums} />}
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
                      {trimItunesCollectionPostfix(release.collectionName)}
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

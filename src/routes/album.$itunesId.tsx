import { Chip } from "../components/chip";
import { Layout } from "../components/layout";
import { PlayButton } from "../components/play-button";
import { getAlbum } from "../lib/api/album";
import { siteName, siteUrl } from "../lib/constants";
import { fmt } from "../lib/utils";
import { createFileRoute, notFound, useRouter } from "@tanstack/solid-router";
import { For } from "solid-js";

export const Route = createFileRoute("/album/$itunesId")({
  loader: async ({ params }) => {
    if (!/^\d+$/.test(params.itunesId)) throw notFound();
    const data = await getAlbum({ data: Number(params.itunesId) });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return {};

    const { album, tracks } = loaderData;
    const title = `${album.collectionName} by ${album.artistName} | ${siteName}`;
    const description = `Explore ${album.collectionName} by ${album.artistName}: release date, genre, and ${tracks.length} tracks with previews on ${siteName}.`;
    const url = `${siteUrl}/album/${params.itunesId}`;
    const artwork = album.artworkUrl100.replace("100x100bb", "600x600bb");

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:type", content: "music.album" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: artwork },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MusicAlbum",
            "@id": url,
            url,
            name: album.collectionName,
            byArtist: { "@type": "MusicGroup", name: album.artistName },
            datePublished: album.releaseDate,
            genre: album.primaryGenreName,
            image: artwork,
            numTracks: tracks.length,
            track: tracks.map((track) => ({
              "@type": "MusicRecording",
              name: track.trackName,
              position: track.trackNumber,
              duration: `PT${Math.round(track.trackTimeMillis / 1000)}S`,
            })),
          }).replace(/</g, "\\u003c"),
        },
      ],
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const data = Route.useLoaderData();
  const album = () => data()!.album;
  const tracks = () => data()!.tracks;
  const router = useRouter();

  const backHref = () =>
    router.buildLocation({
      to: "/search",
      search: { lucky: true, q: album().artistName },
    }).href;

  return (
    <Layout
      header={{ title: album().collectionName, backHref: backHref() }}
      leading={
        <div class="flex flex-col gap-3">
          <img
            src={album().artworkUrl100.replace("100x100bb", "600x600bb")}
            alt={`${album().collectionName} album cover`}
            class="aspect-square w-full"
          />
          <Chip to="/search" search={{ lucky: true, q: album().artistName }}>
            {album().artistName}
          </Chip>
          <p>
            Released{" "}
            {fmt("date", new Date(album().releaseDate), {
              dateStyle: "long",
            })}
          </p>
          <p>Genre: {album().primaryGenreName}</p>
        </div>
      }
      trailing={
        <section
          aria-label="Track list"
          class="flex h-full flex-col gap-3 overflow-x-hidden overflow-y-auto pb-32"
        >
          <h2 class="text-xl font-semibold">Tracks</h2>
          <For each={tracks()}>
            {(track) => (
              <Chip
                hash={String(track.trackId)}
                trailing={
                  <PlayButton
                    class="btn-inverse size-9 shrink-0 justify-center"
                    track={{ title: track.trackName, url: track.previewUrl }}
                  />
                }
              >
                {track.trackName}
              </Chip>
            )}
          </For>
        </section>
      }
    />
  );
}

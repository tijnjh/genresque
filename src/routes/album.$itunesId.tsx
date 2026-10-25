import { AsyncView } from "../components/async-view";
import { Chip } from "../components/chip";
import { Layout } from "../components/layout";
import { PlayButton } from "../components/play-button";
import { proxyItunesLookup } from "../lib/api/server-functions";
import { fmt } from "../lib/utils";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type * as itunes from "itunes-store-api";
import * as v from "valibot";

export const Route = createFileRoute("/album/$itunesId")({
  component: RouteComponent,
  params: {
    parse: v.parser(
      v.object({
        itunesId: v.pipe(v.string(), v.toNumber()),
      }),
    ),
  },
});

function RouteComponent() {
  const { itunesId } = Route.useParams();

  const itunesAlbumDetailsQuery = useQuery({
    queryKey: ["itunes-album-details", itunesId],
    queryFn: async () =>
      await proxyItunesLookup({
        data: {
          type: "id",
          query: itunesId,
          options: { media: "music", entity: "album" },
        },
      }).then((r) => r.results[0] as itunes.ResultAlbum), // fixme - properly type this
  });

  const albumTracksQuery = useQuery({
    queryKey: ["itunes-album-tracks", itunesId],
    queryFn: async () =>
      await proxyItunesLookup({
        data: {
          type: "id",
          query: itunesId,
          options: {
            media: "music",
            entity: "song",
          },
        },
      }).then(
        (r) =>
          (r.results as itunes.ResultMusicTrack[]).filter(
            (t) => t.wrapperType === "track" && t.kind === "song",
          ), // fixme - properly type this
      ),
  });

  return (
    <Layout
      header={{
        title: itunesAlbumDetailsQuery.data?.collectionName ?? "",
        backHref: `/lookup?lucky=true&q=${itunesAlbumDetailsQuery.data?.artistName}`,
      }}

      leading={
        <div className="flex flex-col gap-3">
          <AsyncView query={itunesAlbumDetailsQuery}>
            {(album) => (
              <>
                <img
                  src={album.artworkUrl100}
                  className="aspect-square w-full"
                />

                <Chip
                  to="/lookup"
                  search={{ lucky: true, q: album.artistName }}
                >
                  {album.artistName}
                </Chip>

                {fmt("date", new Date(album.releaseDate), {
                  dateStyle: "long",
                })}

                <p title="the itunes genre is always very non-specific">
                  itunes genre: {album.primaryGenreName}
                </p>
              </>
            )}
          </AsyncView>
        </div>
      }

      trailing={
        <AsyncView query={albumTracksQuery}>
          {(tracks) => (
            <div className="flex h-full flex-col gap-3 overflow-x-hidden overflow-y-auto pb-32">
              {tracks.map((track) => (
                <Chip
                  key={track.trackId}
                  hash={String(track.trackId)}
                  trailing={
                    <PlayButton
                      className="btn-inverse size-9 shrink-0 justify-center"
                      track={{
                        title: track.trackName,
                        url: track.previewUrl,
                      }}
                    />
                  }
                >
                  {track.trackName}
                </Chip>
              ))}
            </div>
          )}
        </AsyncView>
      }
    />
  );

  // return (
  //   <>
  //     <Header
  //       title="album info"
  //       backHref={`/lookup?lucky=true&q=${itunesAlbumDetailsQuery.data?.artistName}`}
  //     />

  //     <Main

  //     />
  //   </>
  // );
}

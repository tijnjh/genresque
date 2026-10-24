import { AsyncView } from "../components/async-view";
import { Chip } from "../components/chip";
import { Header } from "../components/header";
import { Main } from "../components/main";
import { PlayButton } from "../components/play-button";
import { fmt } from "../lib/utils";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import * as itunes from "itunes-store-api";

export const Route = createFileRoute("/album/$itunesId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { itunesId } = Route.useParams();

  const itunesAlbumDetailsQuery = useQuery({
    queryKey: ["itunes-album-details", itunesId],
    queryFn: async () =>
      await itunes
        .lookup("id", Number(itunesId), {
          media: "music",
          entity: "album",
        })
        .then((r) => r.results[0]),
  });

  const albumTracksQuery = useQuery({
    queryKey: ["itunes-album-tracks"],
    queryFn: async () =>
      await itunes
        .lookup("id", Number(itunesId), {
          media: "music",
          entity: "song",
        })
        .then((r) =>
          r.results.filter(
            (t) => t.wrapperType === "track" && t.kind === "song",
          ),
        ),
  });

  return (
    <>
      <Header
        title="album info"
        backHref={`/lookup?lucky=true&q=${itunesAlbumDetailsQuery.data?.artistName}`}
      />

      <Main
        leading={
          <div className="flex flex-col gap-3 md:w-72">
            <AsyncView query={itunesAlbumDetailsQuery}>
              {(album) => (
                <>
                  <img
                    src={album.artworkUrl100}
                    className="aspect-square w-full"
                  />
                  <h1 className="text-3xl font-semibold">
                    {album.collectionName}
                  </h1>

                  <Chip
                    to="/lookup"
                    search={{ lucky: true, q: album.artistName }}
                  >
                    {album.artistName}
                  </Chip>

                  {fmt("date", new Date(album.releaseDate), {
                    dateStyle: "long",
                  })}
                </>
              )}
            </AsyncView>
          </div>
        }

        trailing={
          <AsyncView query={albumTracksQuery}>
            {(tracks) => (
              <div className="flex flex-col gap-3 pb-32">
                {tracks.map((track) => (
                  <Chip
                    key={track.trackId}
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
    </>
  );
}

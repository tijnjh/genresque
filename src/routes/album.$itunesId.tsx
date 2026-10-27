import { AsyncView } from "../components/async-view";
import { Chip } from "../components/chip";
import { Layout } from "../components/layout";
import { PlayButton } from "../components/play-button";
import { $itunes } from "../lib/api/clients/itunes";
import { fmt } from "../lib/utils";
import { useQuery } from "@tanstack/solid-query";
import { createFileRoute, useRouter } from "@tanstack/solid-router";
import { For } from "solid-js";
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
  const params = Route.useParams();

  const itunesAlbumDetailsQuery = useQuery(() => ({
    queryKey: ["itunes-album-details", params().itunesId],
    queryFn: async () =>
      await $itunes
        .lookup("id", params().itunesId, {
          media: "music",
          entity: "album",
        })
        .then((r) => r.results[0]),
  }));

  const albumTracksQuery = useQuery(() => ({
    queryKey: ["itunes-album-tracks", params().itunesId],
    queryFn: async () =>
      await $itunes
        .lookup("id", params().itunesId, {
          media: "music",
          entity: "song",
        })
        .then((r) =>
          r.results.filter(
            (t) => t.wrapperType === "track" && t.kind === "song",
          ),
        ),
  }));

  const router = useRouter();

  const backHref = () =>
    router.buildLocation({
      to: "/search",
      search: {
        lucky: true,
        q: itunesAlbumDetailsQuery.data?.artistName,
      },
    }).href;

  return (
    <Layout
      header={{
        title: itunesAlbumDetailsQuery.data?.collectionName ?? "",
        backHref: backHref(),
      }}

      leading={
        <div class="flex flex-col gap-3">
          <AsyncView query={itunesAlbumDetailsQuery}>
            {(album) => (
              <>
                <img src={album.artworkUrl100} class="aspect-square w-full" />

                <Chip
                  to="/search"
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
            <div class="flex h-full flex-col gap-3 overflow-x-hidden overflow-y-auto pb-32">
              <For each={tracks}>
                {(track) => (
                  <Chip
                    hash={String(track.trackId)}
                    trailing={
                      <PlayButton
                        class="btn-inverse size-9 shrink-0 justify-center"
                        track={{
                          title: track.trackName,
                          url: track.previewUrl,
                        }}
                      />
                    }
                  >
                    {track.trackName}
                  </Chip>
                )}
              </For>
            </div>
          )}
        </AsyncView>
      }
    />
  );
}

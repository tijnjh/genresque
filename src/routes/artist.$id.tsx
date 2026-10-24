import { AsyncView } from "../components/async-view";
import { Chip } from "../components/chip";
import { Header } from "../components/header";
import { Main } from "../components/main";
import { SpotifyWidget } from "../components/spotify-widget";
import {
  getArtistDetailsById,
  getGenresByArtistId,
} from "../lib/api/server-functions";
import { fmt } from "../lib/utils";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import * as itunes from "itunes-store-api";

export const Route = createFileRoute("/artist/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();

  const artistDetailsQuery = useQuery({
    queryKey: ["artist-details", params.id],
    queryFn: async () => getArtistDetailsById({ data: params.id }),
  });

  const artistGenresQuery = useQuery({
    queryKey: ["artist-genres", params.id],
    queryFn: async () => await getGenresByArtistId({ data: params.id }),
  });

  const artistAlbumsQuery = useQuery({
    queryKey: ["artist-itunes-albums", artistDetailsQuery.data?.name],
    queryFn: async () => {
      const artistItunesId = await itunes
        .search(artistDetailsQuery.data!.name, {
          media: "music",
          entity: "musicArtist",
        })
        .then((r) => r.results[0].artistId);

      return await itunes
        .lookup("id", artistItunesId, {
          media: "music",
          entity: "album",
        })
        .then((r) => r.results.filter((a) => a.wrapperType === "collection"));
    },
    enabled: !!artistDetailsQuery.data?.name,
  });

  return (
    <>
      <Header
        title="artist details"
        links={[
          {
            text: "Spotify",
            href: `https://open.spotify.com/artist/${params.id}`,
          },
        ]}
      />

      <Main
        leading={
          <>
            <AsyncView query={artistDetailsQuery}>
              {(artist) => (
                <hgroup className="flex flex-col gap-1.5">
                  <h1 className="text-3xl font-semibold md:text-5xl">
                    {artist.name}
                  </h1>
                  <p className="opacity-75">
                    {fmt("number", artist.followers.total)} spotify followers
                  </p>
                </hgroup>
              )}
            </AsyncView>

            <AsyncView query={artistGenresQuery}>
              {(data) => (
                <div className="cool-grid">
                  {data.map((genre) => (
                    <Chip
                      to="/genre/$slug"
                      key={genre.slug}
                      params={{ slug: genre.slug }}
                    >
                      {genre.name}
                    </Chip>
                  ))}
                </div>
              )}
            </AsyncView>

            <SpotifyWidget id={params.id} type="artist" />
          </>
        }
        trailing={
          <AsyncView query={artistAlbumsQuery}>
            {(albums) => (
              <div className="cool-grid h-fit">
                {albums.map((album) => (
                  <Chip
                    key={album.collectionId}
                    leading={
                      <img src={album.artworkUrl60} className="size-9" />
                    }
                    to="/album/$itunesId"
                    params={{ itunesId: String(album.collectionId) }}
                  >
                    {album.collectionName}
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

import { AsyncView } from "../components/async-view";
import { Chip } from "../components/chip";
import { Header } from "../components/header";
import { Main } from "../components/main";
import { PlayButton } from "../components/play-button";
import { SpotifyWidget } from "../components/spotify-widget";
import { VirtualGrid } from "../components/virtual-grid";
import { getGenreDetails } from "../lib/api/server-functions";
import { findSoundOfPlaylistId } from "../lib/utils";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/genre/$slug")({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();

  const genreDetailsQuery = useQuery({
    queryKey: ["genre-details", params.slug],
    queryFn: async () => await getGenreDetails({ data: params.slug }),
  });

  return (
    <>
      <Header
        title={genreDetailsQuery.data?.genreName || params.slug}
        links={genreDetailsQuery.data?.links}
        backHref="/"
      />

      <AsyncView query={genreDetailsQuery}>
        {(genre) =>
          genre.artists && (
            <Main
              leading={
                <SpotifyWidget
                  id={findSoundOfPlaylistId(genre.links!)!}
                  type="playlist"
                />
              }
              trailing={
                <VirtualGrid entries={genre.artists}>
                  {(artist) => (
                    <Chip
                      key={artist.artistName}
                      to="/artist/$id"
                      params={{ id: artist.id }}
                      trailing={
                        <PlayButton
                          className="btn-inverse size-9 justify-center"
                          title={artist.preview.title!}
                          track={artist.preview}
                        />
                      }
                    >
                      {artist.artistName!}
                    </Chip>
                  )}
                </VirtualGrid>
              }
            />
          )
        }
      </AsyncView>
    </>
  );
}

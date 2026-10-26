import { AsyncView } from "../components/async-view";
import { Chip } from "../components/chip";
import { Layout } from "../components/layout";
import { PlayButton } from "../components/play-button";
import { SpotifyWidget } from "../components/spotify-widget";
import { getGenreDetails } from "../lib/api/server-functions";
import { findSoundOfPlaylistId, genreNameToSlug } from "../lib/utils";
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
    <Layout
      header={{ title: genreDetailsQuery.data?.genreName ?? params.slug }}
      leading={
        genreDetailsQuery.isSuccess && (
          <>
            <SpotifyWidget
              id={findSoundOfPlaylistId(genreDetailsQuery.data.links!)!}
              type="playlist"
            />

            <span className="section-divider">related genres</span>

            <div className="cool-grid">
              {genreDetailsQuery.data.relatedGenres?.map((genre) => (
                <Chip
                  key={genre.genreName}
                  to="/genre/$slug"
                  params={{ slug: genreNameToSlug(genre.genreName) }}
                  trailing={
                    <PlayButton
                      title={genre.previewTitle!}
                      className="bt size-9 shrink-0 justify-center"
                      style={{ backgroundColor: genre.color }}
                      track={{
                        title: genre.previewTitle,
                        url: genre.previewUrl,
                      }}
                    />
                  }
                >
                  {genre.genreName}
                </Chip>
              ))}
            </div>
          </>
        )
      }
      trailing={
        <AsyncView query={genreDetailsQuery}>
          {(genre) => (
            <div className="flex flex-col gap-3 lg:overflow-y-auto">
              <span className="section-divider">artists in this genre</span>

              <div className="grid grid-cols-responsive gap-3">
                {genre.artists?.map((artist) => (
                  <Chip
                    key={artist.artistName}
                    to="/artist/$id"
                    params={{ id: artist.id }}
                    trailing={
                      <PlayButton
                        className="btn size-9 justify-center"
                        style={{ backgroundColor: artist.color }}
                        title={artist.previewTitle!}
                        track={{
                          title: artist.previewTitle,
                          url: artist.previewUrl,
                        }}
                      />
                    }
                  >
                    {artist.artistName!}
                  </Chip>
                ))}
              </div>
            </div>
          )}
        </AsyncView>
      }
    />
  );
}

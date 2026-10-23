import { AsyncView } from "../components/async-view";
import { Header } from "../components/header";
import { PlayButton } from "../components/play-button";
import { VirtualGrid } from "../components/virtual-grid";
import { getGenreDetails } from "../lib/server-functions";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

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
            <VirtualGrid entries={genre.artists}>
              {(artist) => (
                <div className="flex" key={artist.artistName}>
                  <Link
                    to="/artist/$id"
                    className="btn grow overflow-hidden"
                    params={{ id: artist.id! }}
                    title={artist.artistName!}
                  >
                    <span className="truncate">{artist.artistName}</span>
                  </Link>

                  <PlayButton
                    className="btn-inverse size-9 justify-center"
                    title={artist.preview.title!}
                    track={artist.preview}
                  />
                </div>
              )}
            </VirtualGrid>
          )
        }
      </AsyncView>
    </>
  );
}

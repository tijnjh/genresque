import { AsyncView } from "../components/async-view";
import { Header } from "../components/header";
import { VirtualGrid } from "../components/virtual-grid";
import { getGenresByArtistId } from "../lib/server-functions";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/artist/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();

  const artistGenresQuery = useQuery({
    queryKey: ["artist-genres", params.id],
    queryFn: async () => await getGenresByArtistId({ data: params.id }),
  });

  return (
    <>
      <Header
        title={`${params.id}'s genres`}
        links={[
          {
            text: "Spotify",
            href: `https://open.spotify.com/artist/${params.id}`,
          },
        ]}
      />
      <AsyncView query={artistGenresQuery}>
        {(data) => (
          <VirtualGrid entries={data}>
            {(genre) => (
              <Link
                className="btn"
                to="/genre/$slug"
                params={{ slug: genre.slug }}
              >
                {genre.name}
              </Link>
            )}
          </VirtualGrid>
        )}
      </AsyncView>
    </>
  );
}

import { AsyncView } from "../components/async-view";
import { Chip } from "../components/chip";
import { Header } from "../components/header";
import { Main } from "../components/main";
import { SpotifyWidget } from "../components/spotify-widget";
import { VirtualGrid } from "../components/virtual-grid";
import { getGenresByArtistId } from "../lib/api/server-functions";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

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
          <Main
            leading={<SpotifyWidget id={params.id} type="artist" />}
            trailing={
              <VirtualGrid entries={data}>
                {(genre) => (
                  <Chip to="/genre/$slug" params={{ slug: genre.slug }}>
                    {genre.name}
                  </Chip>
                )}
              </VirtualGrid>
            }
          />
        )}
      </AsyncView>
    </>
  );
}

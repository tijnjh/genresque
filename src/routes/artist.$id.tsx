import { AsyncView } from "../components/async-view";
import { Chip } from "../components/chip";
import { Layout } from "../components/layout";
import { SpotifyWidget } from "../components/spotify-widget";
import { itunes } from "../lib/api/itunes";
import {
  getArtistDetailsById,
  getGenresByArtistId,
} from "../lib/api/server-functions";
import { genreNameToSlug } from "../lib/utils";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ResultAlbum } from "itunes-store-api";

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

  return (
    <Layout
      header={{
        title: artistDetailsQuery.data?.name ?? "",
      }}

      leading={
        <>
          <SpotifyWidget id={params.id} type="artist" className="h-38!" />

          <AsyncView query={artistGenresQuery}>
            {(data) =>
              !!data.length && (
                <>
                  <span className="section-divider">
                    genres this artist is in
                  </span>

                  <div className="cool-grid">
                    {data.map((genre) => (
                      <Chip
                        to="/genre/$slug"
                        key={genre}
                        params={{ slug: genreNameToSlug(genre) }}
                      >
                        {genre}
                      </Chip>
                    ))}
                  </div>
                </>
              )
            }
          </AsyncView>
        </>
      }

      trailing={
        artistDetailsQuery.data?.name && (
          <ArtistReleasesList artistName={artistDetailsQuery.data?.name} />
        )
      }
    />
  );
}

function ArtistReleasesList({ artistName }: { artistName: string }) {
  const artistAlbumsQuery = useQuery({
    queryKey: ["artist-itunes-albums", artistName],
    queryFn: async () => {
      const artistItunesId = await itunes
        .search(artistName, {
          media: "music",
          entity: "musicArtist",
        })
        .then((r) => r.results[0]?.artistId);

      if (!artistItunesId)
        throw new Error(
          `could't find id for artist: -- ${artistName} -- on itunes`,
        );

      return await itunes
        .lookup("id", artistItunesId, {
          media: "music",
          entity: "album",
        })
        .then((r) => r.results.filter((a) => a.wrapperType === "collection"));
    },
  });

  return (
    <AsyncView query={artistAlbumsQuery}>
      {(releases) => {
        const organizedReleases = organizeArtistReleases(releases);

        return (
          <div className="lg:overflow-y-auto">
            {Object.entries(organizedReleases).map(
              ([name, releases]) =>
                !!releases.length && (
                  <div key={name} className="flex flex-col gap-3">
                    <span className="section-divider">{name}</span>

                    <div className="cool-grid">
                      {releases.map((release) => (
                        <Chip
                          key={release.collectionId}
                          leading={release.artworkUrl60}
                          to="/album/$itunesId"
                          params={{ itunesId: release.collectionId }}
                        >
                          {streamlineReleaseName(release.collectionName)}
                        </Chip>
                      ))}
                    </div>
                  </div>
                ),
            )}
          </div>
        );
      }}
    </AsyncView>
  );
}

function organizeArtistReleases(releases: ResultAlbum[]) {
  // remove cleaned version
  releases = releases.filter((r) => r.collectionExplicitness !== "cleaned");

  const albums: ResultAlbum[] = [];
  const eps: ResultAlbum[] = [];
  const singles: ResultAlbum[] = [];

  for (const release of releases) {
    const name = release.collectionName;

    switch (true) {
      case name.endsWith(" - Single"):
        singles.push(release);
        break;

      case name.endsWith(" - EP"):
        eps.push(release);
        break;

      default:
        albums.push(release);
        break;
    }
  }

  return { albums, eps, singles };
}

function streamlineReleaseName(releaseName: string) {
  return releaseName.replace(" - Single", "").replace(" - EP", "");
}

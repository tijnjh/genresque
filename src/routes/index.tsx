import { getAllGenres } from "../lib/server-functions";
import { createFileRoute } from "@tanstack/react-router";
import { cn } from "cn";

export const Route = createFileRoute("/")({
  component: RouteComponent,
  loader: async () => {
    const genres = await getAllGenres();
    return { genres };
  },
});

function RouteComponent() {
  // const version = 1;

  const { genres } = Route.useLoaderData();

  // return <h1>Hello TanStack Start {version}!</h1>;

  return (
    <>
      <div className="col-span-full grid grid-cols-subgrid">
        <input
          // value={searchParams.q}
          className="col-span-full thing w-full md:col-[2/-2] md:my-9"
          placeholder="filter genres"
        />
      </div>

      <ul className={cn("")}>
        {genres.map((genre) => {
          if (genre) {
            const uid = Math.random().toString().substring(2, 9);

            return (
              <li key={genre.name} className="contents">
                <button
                  commandfor={`${uid}-popover`}
                  command="toggle-popover"
                  style={{ anchorName: `--${uid}` }}
                >
                  {genre.name}
                </button>
                <div
                  id={`${uid}-popover`}
                  popover="auto"
                  // style="top: anchor(--{uid} end); left: anchor(--{uid} start);"
                  style={{
                    top: `anchor(--${uid} end)`,
                    left: `anchor(--${uid} start)`,
                  }}
                  className="absolute border p-2 shadow"
                >
                  {/* <!-- <button commandfor="{uid}-popover" command="hide-popover">Close</button> */}
                  {/* Popover content --> */}

                  {genre.preview.title}

                  <audio
                    src={genre.preview.url}
                    controls
                    preload="none"
                  ></audio>
                </div>
              </li>
            );
          }
        })}
      </ul>
    </>
  );
}

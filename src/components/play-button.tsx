import { nowPlaying, setNowPlaying } from "../lib/global";
import { JSX, splitProps } from "solid-js";

export function PlayButton(
  props: JSX.HTMLAttributes<HTMLButtonElement> & {
    track: { title: string | undefined; url: string | undefined };
  },
) {
  const [local, rest] = splitProps(props, ["track"]);

  const isThisTrackPlaying = () => nowPlaying().url === local.track.url;

  return (
    <button
      {...rest}
      onClick={() => {
        isThisTrackPlaying()
          ? setNowPlaying({ title: undefined, url: undefined })
          : setNowPlaying(local.track);
      }}
    >
      {isThisTrackPlaying() ? "☐" : "▶︎"}
    </button>
  );
}

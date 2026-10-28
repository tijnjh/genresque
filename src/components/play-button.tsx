import { nowPlaying, setNowPlaying } from "#lib/global";
import { JSX } from "@solidjs/web";
import { omit } from "solid-js";

export function PlayButton(
  props: JSX.HTMLAttributes<HTMLButtonElement> & {
    track: { title: string | undefined; url: string | undefined };
  },
) {
  const rest = omit(props, "track");

  const isThisTrackPlaying = () => nowPlaying().url === props.track.url;

  return (
    <button
      {...rest}
      onClick={() => {
        isThisTrackPlaying()
          ? setNowPlaying({ title: undefined, url: undefined })
          : setNowPlaying(props.track);
      }}
    >
      {isThisTrackPlaying() ? "☐" : "▶︎"}
    </button>
  );
}

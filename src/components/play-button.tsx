import { nowPlayingAtom } from "../lib/atoms";
import * as Base from "@base-ui/react";
import { useAtom } from "jotai";

export function PlayButton({
  track,
  ...props
}: Base.ButtonProps & {
  track: { title: string | null; url: string | null };
}) {
  const [nowPlaying, setNowPlaying] = useAtom(nowPlayingAtom);
  const isThisTrackPlaying = nowPlaying.url === track.url;

  return (
    <Base.Button
      {...props}
      onClick={() => {
        isThisTrackPlaying
          ? setNowPlaying({ title: null, url: null })
          : setNowPlaying(track);
      }}
    >
      {isThisTrackPlaying ? "☐" : "▶︎"}
    </Base.Button>
  );
}

import { nowPlayingAtom } from "../lib/atoms";
import { useAtom } from "jotai";
import { ButtonHTMLAttributes } from "react";

export function PlayButton({
  track,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  track: { title: string | null; url: string | null };
}) {
  const [nowPlaying, setNowPlaying] = useAtom(nowPlayingAtom);
  const isThisTrackPlaying = nowPlaying.url === track.url;

  return (
    <button
      {...props}
      onClick={() => {
        isThisTrackPlaying
          ? setNowPlaying({ title: null, url: null })
          : setNowPlaying(track);
      }}
    >
      {isThisTrackPlaying ? "☐" : "▶︎"}
    </button>
  );
}

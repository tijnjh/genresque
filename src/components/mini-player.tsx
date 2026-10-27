import { nowPlayingAtom } from "../lib/atoms";
import { useAtom } from "jotai";
import { useEffect, useRef, Activity } from "react";

export function MiniPlayer() {
  const [nowPlaying, setNowPlaying] = useAtom(nowPlayingAtom);

  const audioRef = useRef<HTMLAudioElement>(undefined!);

  useEffect(() => {
    audioRef.current?.play();
  }, [nowPlaying]);

  const cleanTitle = nowPlaying.title?.replace("e.g.", "").trim();

  return (
    <Activity mode={nowPlaying.url ? "visible" : "hidden"}>
      <div className="fixed right-3 bottom-3 left-3 z-999 flex flex-col gap-3 border bg-zinc-50-950 p-3 md:w-100!">
        <div className="flex items-center justify-between">
          <span title={cleanTitle} className="truncate">
            {cleanTitle}
          </span>

          <button
            className="btn-inverse size-9 justify-center"
            onClick={() => setNowPlaying({ title: null, url: null })}
          >
            &times;
          </button>
        </div>

        {nowPlaying.url && (
          <audio ref={audioRef} src={nowPlaying.url} controls></audio>
        )}
      </div>
    </Activity>
  );
}

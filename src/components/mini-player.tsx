import { nowPlaying, setNowPlaying } from "../lib/global";
import { cn } from "cn";
import { createEffect, on, Show } from "solid-js";

export function MiniPlayer() {
  let audioRef!: HTMLAudioElement;

  createEffect(() => {
    on(nowPlaying, () => {
      audioRef?.play();
    });
  });

  const cleanTitle = () => nowPlaying().title?.replace("e.g.", "").trim();

  return (
    <div
      class={cn(
        "fixed right-3 bottom-3 left-3 z-999 flex-col gap-3 border bg-zinc-50-950 p-3 md:w-100!",
        nowPlaying().url ? "flex" : "hidden",
      )}
    >
      <div class="flex items-center justify-between">
        <span title={cleanTitle()} class="truncate">
          {cleanTitle()}
        </span>

        <button
          class="btn-inverse size-9 justify-center"
          onClick={() => setNowPlaying({ title: undefined, url: undefined })}
        >
          &times;
        </button>
      </div>

      <Show when={nowPlaying().url}>
        <audio ref={audioRef} src={nowPlaying().url} controls></audio>
      </Show>
    </div>
  );
}

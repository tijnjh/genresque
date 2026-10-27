import { createSignal } from "solid-js";

export const [nowPlaying, setNowPlaying] = createSignal<{
  title: string | undefined;
  url: string | undefined;
}>({
  title: undefined,
  url: undefined,
});

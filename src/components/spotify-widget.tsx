import { cn } from "cn";
import { JSX, splitProps } from "solid-js";

export function SpotifyWidget(
  props: JSX.IframeHTMLAttributes<HTMLIFrameElement> & {
    id: string;
    type: "playlist" | "album" | "artist";
  },
) {
  const [local, rest] = splitProps(props, ["class", "type", "id"]);

  return (
    <iframe
      {...rest}
      class={cn("h-38 w-full rounded-xl", local.class)}
      src={`https://open.spotify.com/embed/${local.type}/${local.id}`}
      allowfullscreen
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
    />
  );
}

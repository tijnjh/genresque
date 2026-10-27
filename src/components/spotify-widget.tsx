import { JSX } from "@solidjs/web";
import { cn } from "cn";
import { omit } from "solid-js";

export function SpotifyWidget(
  props: JSX.IframeHTMLAttributes<HTMLIFrameElement> & {
    id: string;
    type: "playlist" | "album" | "artist";
  },
) {
  const rest = omit(props, "class", "type", "id");

  return (
    <iframe
      {...rest}
      class={cn("h-38 w-full rounded-xl", props.class)}
      src={`https://open.spotify.com/embed/${props.type}/${props.id}`}
      allowfullscreen
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
    />
  );
}

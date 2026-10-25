import { HTMLProps } from "@base-ui/react";
import { cn } from "cn";

export function SpotifyWidget({
  className,
  type,
  id,
  ...props
}: HTMLProps & {
  id: string;
  type: "playlist" | "album" | "artist";
}) {
  return (
    <iframe
      {...props}
      className={cn("h-38 w-full rounded-xl", className)}
      src={`https://open.spotify.com/embed/${type}/${id}`}
      allowFullScreen
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
    />
  );
}

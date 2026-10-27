import { cn } from "cn";
import { IframeHTMLAttributes } from "react";

export function SpotifyWidget({
  className,
  type,
  id,
  ...props
}: IframeHTMLAttributes<HTMLIFrameElement> & {
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

import { Link, LinkProps } from "@tanstack/react-router";
import { cn } from "cn";
import { ReactNode } from "react";
import { Marquee } from "tiny-marquee";

export function Chip({
  leading,
  trailing,
  children,
  className,
  inverse = false,
  ...props
}: LinkProps & {
  children?: string;
  leading?: ReactNode | string;
  trailing?: ReactNode;
  inverse?: boolean;
  className?: string;
}) {
  return (
    <div className="flex h-9 items-center">
      {typeof leading === "string" ? (
        <img className="aspect-square size-9" src={leading} />
      ) : (
        leading
      )}

      <Link
        {...props}
        draggable={false}
        className={cn(
          "min-w-0 grow items-center px-0 [-webkit-touch-callout:none]",
          inverse ? "btn-inverse" : "btn",
          className,
        )}
      >
        <Marquee initialPosition="start">
          <span className="px-3">{children}</span>
        </Marquee>
      </Link>

      {trailing}
    </div>
  );
}

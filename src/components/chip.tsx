import { Link, LinkProps } from "@tanstack/solid-router";
import { cn } from "cn";
import { JSX, splitProps } from "solid-js";

// import { Marquee } from "tiny-marquee";

export function Chip(
  props: LinkProps & {
    children?: string;
    leading?: JSX.Element | string;
    trailing?: JSX.Element;
    inverse?: boolean;
    class?: string;
  },
) {
  const [local, rest] = splitProps(props, [
    "children",
    "leading",
    "trailing",
    "inverse",
    "class",
  ]);

  return (
    <div class="flex h-9 items-center">
      {typeof local.leading === "string" ? (
        <img class="aspect-square size-9" src={local.leading} />
      ) : (
        local.leading
      )}

      <Link
        {...rest}
        draggable={false}
        class={cn(
          "min-w-0 grow items-center px-0 [-webkit-touch-callout:none]",
          local.inverse ? "btn-inverse" : "btn",
          local.class,
        )}
      >
        {/* <Marquee initialPosition="start"> */}
        <span class="px-3">{local.children}</span>
        {/* </Marquee> */}
      </Link>

      {local.trailing}
    </div>
  );
}

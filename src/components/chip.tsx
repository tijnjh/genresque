import { JSX } from "@solidjs/web";
import { Link, LinkProps } from "@tanstack/solid-router";
import { cn } from "cn";
import { omit } from "solid-js";

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
  const rest = omit(
    props,
    "children",
    "leading",
    "trailing",
    "inverse",
    "class",
  );

  return (
    <div class="flex h-9 items-center">
      {typeof props.leading === "string" ? (
        <img class="aspect-square size-9" src={props.leading} />
      ) : (
        props.leading
      )}

      <Link
        {...rest}
        draggable={false}
        class={cn(
          "min-w-0 grow items-center px-0 [-webkit-touch-callout:none]",
          props.inverse ? "btn-inverse" : "btn",
          props.class,
        )}
      >
        {/* <Marquee initialPosition="start"> */}
        <span class="truncate px-3" title={props.children}>
          {props.children}
        </span>
        {/* </Marquee> */}
      </Link>

      {props.trailing}
    </div>
  );
}

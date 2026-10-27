import { fixRelativeUrl } from "../lib/utils";
import { Link } from "@tanstack/solid-router";
import { cn } from "cn";
import { ComponentProps, For, Show } from "solid-js";
import { JSX } from "solid-js";
import { MergeExclusive } from "type-fest";

export function Layout(
  props: { header: ComponentProps<typeof Header> } & MergeExclusive<
    { children?: JSX.Element },
    { leading: JSX.Element; trailing: JSX.Element }
  >,
) {
  return (
    <div class="grid grid-rows-[1fr_auto] overflow-hidden md:grid-rows-[auto_1fr]">
      <Header {...props.header} />

      <div class="grid overflow-y-auto p-3">
        <Show
          when={props.children}
          fallback={
            <>
              <Title title={props.header.title} />

              <main class="grid h-full grid-cols-1 gap-6 lg:grid-cols-[auto_1fr] lg:overflow-hidden">
                <div class="flex w-full flex-col gap-3 lg:w-72 xl:w-115">
                  {props.leading}
                </div>
                {props.trailing}
              </main>
            </>
          }
        >
          <main class="overflow-hidden">
            <Title title={props.header.title} />
            {props.children}
          </main>
        </Show>
      </div>
    </div>
  );
}

function Title(props: { title: string }) {
  return (
    <h1 class="mb-3 h-9 truncate text-2xl font-bold md:hidden">
      {props.title}
    </h1>
  );
}

export function Header(
  props: {
    backHref?: string;
    title: string;
  } & MergeExclusive<
    { links?: Array<{ text: string; href: string }> },
    { children: JSX.Element }
  >,
) {
  // we hide this button cus its too wide and doesn't provide much functionality in this case
  const links = () =>
    props.links?.filter((l) => l.text !== "Every Noise at Once");

  return (
    <header
      class={cn([
        "flex gap-3 overflow-hidden border-zinc-300-700 p-3 max-md:order-1 max-md:flex-col max-md:border-t md:h-15 md:items-center md:justify-between md:border-b",
        !props.backHref && !props.children && "max-md:hidden",
      ])}
    >
      <div
        class={cn(
          "flex items-center gap-3",
          !props.backHref && "max-md:hidden",
        )}
      >
        <Show when={props.backHref}>
          {(to) => (
            <Link to={to()} class="btn-inverse size-9 justify-center">
              ←
            </Link>
          )}
        </Show>
        <h1 class="truncate text-2xl font-bold max-md:hidden">{props.title}</h1>
      </div>

      <Show
        when={props.children}
        fallback={
          <Show when={links()?.length}>
            <ul class="flex scrollbar-none gap-3 overflow-x-auto">
              <For each={links()}>
                {(link) => (
                  <li class="first:ml-3 last:mr-3">
                    <a
                      href={fixRelativeUrl(link.href)}
                      target="_blank"
                      class="btn-inverse"
                    >
                      {link.text}
                    </a>
                  </li>
                )}
              </For>
            </ul>
          </Show>
        }
      >
        {(children) => children()}
      </Show>
    </header>
  );
}

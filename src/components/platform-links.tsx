import { For, Show } from "solid-js";

export interface PlatformLink {
  name: string;
  icon?: string;
  href: string;
}

export function PlatformLinks(props: { links: PlatformLink[] }) {
  return (
    <div class="flex flex-wrap gap-3">
      <For each={props.links}>
        {(link) => (
          <a href={link.href} class="btn" target="_blank">
            <Show when={link.icon}>
              {(icon) => <img class="size-5" src={icon()} />}
            </Show>
            {link.name}
          </a>
        )}
      </For>
    </div>
  );
}

/// <reference types="vite/client" />
import { ErrorAlert } from "../components/error-alert";
import { MiniPlayer } from "../components/mini-player";
import { getErrorMessage } from "../lib/utils";
import styleCss from "../style.css?url";
import { HydrationScript } from "@solidjs/web";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import {
  CatchBoundary,
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
} from "@tanstack/solid-router";
import { For } from "solid-js";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
    ],
    links: [{ href: styleCss, rel: "stylesheet" }],
  }),

  component: RootComponent,
});

const tabs = [
  ["genres", "/"],
  ["search", "/search"],
] as const;

function RootComponent() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <html lang="en" class="pointer-coarse:overscroll-none">
        <head>
          <HydrationScript />
          <HeadContent />
        </head>

        <body class="relative isolate touch-manipulation bg-zinc-200-800 text-black scheme-light-dark select-none dark:text-white">
          <div class="grid h-dvh grid-cols-1 overflow-hidden max-md:grid-rows-[1fr_min-content] md:grid-cols-[auto_1fr]">
            <Aside />

            <CatchBoundary
              getResetKey={() => "reset"}
              errorComponent={({ error }) => (
                <ErrorAlert message={getErrorMessage(error)} />
              )}
            >
              <Outlet />
            </CatchBoundary>
          </div>

          <MiniPlayer />

          <Scripts />
        </body>
      </html>
    </QueryClientProvider>
  );
}

function Aside() {
  return (
    <aside class="z-999 flex h-full flex-col gap-3 border-zinc-300-700 p-3 max-md:order-1 max-md:border-t md:w-72 md:border-r">
      <span class="h-9 text-2xl font-bold max-md:hidden">genresque</span>

      <div class="flex gap-3 md:contents">
        <For each={tabs}>
          {([name, to]) => (
            <Link
              activeProps={{ class: "btn-inverse" }}
              inactiveProps={{ class: "btn" }}
              to={to}
            >
              {name}
            </Link>
          )}
        </For>
      </div>
    </aside>
  );
}

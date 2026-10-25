/// <reference types="vite/client" />
import { ErrorAlert } from "../components/error-alert";
import { MiniPlayer } from "../components/mini-player";
import { getErrorMessage } from "../lib/utils";
import styleCss from "../style.css?url";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  CatchBoundary,
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { NuqsAdapter } from "nuqs/adapters/tanstack-router";
import { StrictMode } from "react";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

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
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <NuqsAdapter>
          <html lang="en" className="overscroll-none">
            <head>
              <HeadContent />
            </head>

            <body className="relative isolate touch-manipulation overscroll-none bg-zinc-200-800 text-black scheme-light-dark select-none dark:text-white">
              <div className="grid h-dvh grid-cols-1 overflow-hidden max-md:grid-rows-[1fr_min-content] md:grid-cols-[auto_1fr]">
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
        </NuqsAdapter>
      </QueryClientProvider>
    </StrictMode>
  );
}

function Aside() {
  return (
    <aside className="z-999 flex h-full flex-col gap-3 border-zinc-300-700 p-3 max-md:order-1 max-md:border-t md:w-72 md:border-r">
      <span className="h-9 text-2xl font-bold max-md:hidden">genresque</span>

      <div className="flex gap-3 md:contents">
        {tabs.map(([name, to]) => (
          <Link
            key={to}
            activeProps={{ className: "btn-inverse" }}
            inactiveProps={{ className: "btn" }}
            to={to}
          >
            {name}
          </Link>
        ))}
      </div>
    </aside>
  );
}

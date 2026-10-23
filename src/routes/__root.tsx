/// <reference types="vite/client" />
import { MiniPlayer } from "../components/mini-player";
import styleCss from "../style.css?url";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRoute,
  HeadContent,
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

function RootComponent() {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <NuqsAdapter>
          <html lang="en">
            <head>
              <HeadContent />
            </head>

            <body className="relative isolate grid h-dvh touch-manipulation grid-rows-[min-content_1fr] bg-zinc-200-800 text-zinc-950-50 scheme-light-dark">
              <Outlet />

              <MiniPlayer />

              <Scripts />
            </body>
          </html>
        </NuqsAdapter>
      </QueryClientProvider>
    </StrictMode>
  );
}

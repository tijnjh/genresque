/// <reference types="vite/client" />
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { StrictMode } from "react";

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
    links: [{ href: "/src/style.css", rel: "stylesheet" }],
  }),

  component: RootComponent,
});

function RootComponent() {
  return (
    <StrictMode>
      <html lang="en">
        <head>
          <HeadContent />
        </head>
        <body>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-px">
            <Outlet />
          </div>

          <Scripts />
        </body>
      </html>
    </StrictMode>
  );
}

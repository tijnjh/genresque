/// <reference types="vite/client" />
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { StrictMode } from "react";
import styleCss from "../style.css?url";

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
      <html lang="en">
        <head>
          <HeadContent />
        </head>
        <body>
          <Outlet />

          <Scripts />
        </body>
      </html>
    </StrictMode>
  );
}

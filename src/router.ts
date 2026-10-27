import { routeTree } from "./routeTree.gen";
import { createRouter } from "@tanstack/solid-router";

export function getRouter() {
  return createRouter({ routeTree, scrollRestoration: true });
}

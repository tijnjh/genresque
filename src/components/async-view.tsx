import { UseQueryResult } from "@tanstack/react-query";
import { ReactNode } from "react";

export function AsyncView<T extends UseQueryResult>({
  query,
  children,
}: {
  query: T;
  children: (arg: NonNullable<T["data"]>) => ReactNode;
}) {
  switch (query.status) {
    case "pending":
      return (
        <div className="grid size-full grow cursor-wait place-items-center">
          <div className="size-9 animate-spin rounded-full border-4 border-zinc-300-700 border-t-zinc-600-400" />
        </div>
      );

    case "error":
      return (
        <div className="grid size-full grow place-items-center">
          <div className="max-w-xl bg-red-200 p-4 text-red-700">
            {query.error.message}
          </div>
        </div>
      );

    case "success":
      return children(query.data!);
  }
}

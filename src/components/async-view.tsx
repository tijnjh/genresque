import { UseQueryResult } from "@tanstack/solid-query";
import { JSX, Match, Switch } from "solid-js";

export function AsyncView<T extends UseQueryResult>(props: {
  query: T;
  children: (arg: NonNullable<T["data"]>) => JSX.Element;
}) {
  return (
    <Switch>
      <Match when={props.query.status === "pending"}>
        <div class="grid size-full grow cursor-wait place-items-center">
          <div class="size-9 animate-spin rounded-full border-4 border-zinc-300-700 border-t-zinc-600-400" />
        </div>
      </Match>
      <Match when={props.query.status === "error"}>
        <div class="grid size-full grow place-items-center">
          <div class="max-w-xl bg-red-200 p-4 text-red-700">
            {props.query.error?.message}
          </div>
        </div>
      </Match>
      <Match when={props.query.status === "success"}>
        {props.children(props.query.data!)}
      </Match>
    </Switch>
  );
}

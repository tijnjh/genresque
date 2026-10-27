import { Spinner } from "./spinner";
import { JSX } from "@solidjs/web";
import { UseQueryResult } from "@tanstack/solid-query";
import { Match, Switch, Loading } from "solid-js";

export function AsyncView<T extends UseQueryResult>(props: {
  query: T;
  children: (arg: NonNullable<T["data"]>) => JSX.Element;
}) {
  return (
    <Loading fallback={<LoadingView />}>
      <Switch fallback={<LoadingView />}>
        <Match when={props.query.status === "error"}>
          <div class="grid size-full grow place-items-center">
            <div class="max-w-xl bg-red-200 p-4 text-red-700">
              {props.query.error?.message}
            </div>
          </div>
        </Match>
        <Match
          when={props.query.data !== undefined && props.query.data !== null}
        >
          {props.children(props.query.data!)}
        </Match>
      </Switch>
    </Loading>
  );
}

function LoadingView() {
  return (
    <div class="grid size-full grow cursor-wait place-items-center">
      <Spinner />
    </div>
  );
}

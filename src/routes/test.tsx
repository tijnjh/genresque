import { AsyncView } from "../components/async-view";
import { getUserFollowerCount } from "../lib/api/remote/aoty";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/test")({
  component: RouteComponent,
});

function RouteComponent() {
  const query = useQuery({
    queryKey: [""],
    queryFn: async () => {
      return getUserFollowerCount({ data: "jahsias" });
    },
  });

  return <AsyncView query={query}>{(data) => data}</AsyncView>;
}

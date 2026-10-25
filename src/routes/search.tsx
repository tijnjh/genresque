import { Layout } from "../components/layout";
import { Button, Input } from "@base-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/search")({
  component: RouteComponent,
});

function RouteComponent() {
  const [searchQuery, setSearchQuery] = useState<string>();

  return (
    <Layout header={{ title: "search" }}>
      <form
        className="flex grow gap-3 md:max-w-md"
        action="/lookup"
        onSubmit={(e) => {
          if (!searchQuery?.trim()) e.preventDefault();
        }}
      >
        <Input
          value={searchQuery ?? ""}
          onValueChange={(val) => setSearchQuery(val)}
          className="h-9 min-w-0 grow bg-zinc-50-950 px-3"
          name="q"
          placeholder="look up an artist"
        />

        <Button type="submit" className="btn-inverse size-9 justify-center">
          →
        </Button>
      </form>
    </Layout>
  );
}

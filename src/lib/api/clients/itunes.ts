import { isIos } from "../../utils";
import { createServerFn } from "@tanstack/solid-start";
import * as itunes from "itunes-store-api";

// apple added some crazy redirect stuff with this api on on ios so i have to do it server side on there
const proxyItunes = createServerFn()
  .validator(
    (
      data:
        | ["search", ...Parameters<typeof itunes.search>]
        | ["lookup", ...Parameters<typeof itunes.lookup>],
    ) => data,
  )

  .handler(({ data }) => {
    switch (data[0]) {
      case "search": {
        const [, search, options] = data;
        return itunes.search(search, options);
      }
      case "lookup": {
        const [, type, value, options] = data;
        return itunes.lookup(type, value, options);
      }
    }
  });

// more typed wrapper
const proxied: {
  search: typeof itunes.search;
  lookup: typeof itunes.lookup;
} = {
  search: (search, options) =>
    // @ts-expect-error
    proxyItunes({ data: ["search", search, options] }),
  lookup: (type, value, options) =>
    // @ts-expect-error ffs these overloads bro
    proxyItunes({ data: ["lookup", type, value, options] }),
};

// if not on ios you can just call itunes from the client directly
export const $itunes = isIos() ? proxied : itunes;

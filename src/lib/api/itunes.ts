import { isIos } from "../utils";
import { createServerFn } from "@tanstack/solid-start";
import * as isa from "itunes-store-api";

// apple added some crazy redirect stuff with this api on on ios so i have to do it server side on there
const proxyItunes = createServerFn()
  .validator(
    (
      data:
        | ["search", ...Parameters<typeof isa.search>]
        | ["lookup", ...Parameters<typeof isa.lookup>],
    ) => data,
  )

  .handler(({ data }) => {
    switch (data[0]) {
      case "search": {
        const [, search, options] = data;
        return isa.search(search, options);
      }
      case "lookup": {
        const [, type, value, options] = data;
        return isa.lookup(type, value, options);
      }
    }
  });

// more typed wrapper
const proxied: {
  search: typeof isa.search;
  lookup: typeof isa.lookup;
} = {
  search: (search, options) =>
    // @ts-expect-error
    proxyItunes({ data: ["search", search, options] }),
  lookup: (type, value, options) =>
    // @ts-expect-error ffs these overloads bro
    proxyItunes({ data: ["lookup", type, value, options] }),
};

// if not on ios you can just call itunes from the client directly
export const itunes = isIos() ? proxied : isa;

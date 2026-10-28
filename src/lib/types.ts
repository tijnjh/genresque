import type {} from "itunes-store-api";

declare global {
  export namespace Everynoise {
    interface Genre {
      genreName: string;
      color: string;
      previewUrl: string;
      previewTitle: string;
    }
  }

  export namespace Spotify {
    interface Artist {
      name: string;
      id: string;
      images: Array<{ url: string }>;
    }
  }

  // @ts-expect-error
  export type * as Itunes from "itunes-store-api";
}

export {};

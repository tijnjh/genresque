import { atom } from "jotai";

export const nowPlayingAtom = atom<{
  title: string | null;
  url: string | null;
}>({ title: null, url: null });

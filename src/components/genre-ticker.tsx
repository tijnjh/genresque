import { memo } from "react";
import { Popover } from "@base-ui/react/popover";

export const GenreTicker = memo(function GenreTicker({
  genre,
}: {
  genre: enoa.Genre;
}) {
  // the marquee string and the normal one have to be the exact same width otherwise it will glitch ;-;
  const PaddedStr = () => <span className="px-3 capitalize">{genre.name}</span>;

  return (
    <Popover.Root>
      <Popover.Trigger openOnHover delay={0} className="w-full bg-white h-9">
        <span
          data-genre-label
          className="group/ticker block min-w-0 w-full overflow-hidden text-left contain-[inline-size_paint]"
        >
          <span className="relative block w-max whitespace-nowrap motion-safe:group-[[data-overflow][data-visible]]/ticker:animate-genre-ticker">
            <PaddedStr />
            <span
              className="absolute top-0 left-[calc(100%+24px)] hidden group-[[data-overflow][data-visible]]/ticker:block"
              aria-hidden="true"
            >
              <PaddedStr />
            </span>
          </span>
        </span>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Backdrop />

        <Popover.Positioner
          sideOffset={4}
          className="bg-white shadow-xl"
          align="start"
        >
          <Popover.Popup className="p-4 flex flex-col gap-4">
            {genre.preview.title}
            <audio src={genre.preview.url} controls />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
});

import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef, useState } from "react";
import { useGenreTickers } from "../hooks/use-genre-tickers";
import { GenreTicker } from "./genre-ticker";

const gap = { x: 4, y: 0 };

export function GenreGrid({ genres }: { genres: enoa.Genre[] }) {
  useEffect(() => {
    // @ts-expect-error dey no have types
    import("interestfor");
  }, []);

  const gridRef = useGenreTickers(genres);

  const parentRef = useRef<HTMLDivElement>(null);

  const [{ columns, itemSize }, setLayout] = useState({
    columns: 1,
    itemSize: { height: 40, width: 300 },
  });

  useEffect(() => {
    const parent = parentRef.current;
    if (!parent) return;

    const update = () => {
      const width = parent.clientWidth;
      const rem = parseFloat(
        getComputedStyle(document.documentElement).fontSize,
      );
      const minWidth = 10 * rem;

      const columns = Math.max(
        1,
        Math.floor((width + gap.x) / (minWidth + gap.x)),
      );

      const layout = {
        columns,
        itemSize: {
          height: 40,
          width: Math.max(minWidth, (width - gap.x * (columns - 1)) / columns),
        },
      };
      setLayout((previous) =>
        previous.columns === layout.columns &&
        previous.itemSize.width === layout.itemSize.width
          ? previous
          : layout,
      );
    };

    const observer = new ResizeObserver(update);
    observer.observe(parent);
    update();

    return () => observer.disconnect();
  }, []);

  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(genres.length / columns),
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemSize.height,
    gap: gap.y,
    overscan: 8,
  });

  return (
    <div ref={parentRef} className="h-dvh overflow-auto">
      <ul
        ref={gridRef}
        className="relative m-0 list-none p-0"
        style={{
          height: rowVirtualizer.getTotalSize(),
          width: "100%",
        }}
      >
        {rowVirtualizer.getVirtualItems().flatMap((row) =>
          Array.from({ length: columns }, (_, column) => {
            const index = row.index * columns + column;
            const genre = genres[index];

            if (!genre) return null;

            return (
              <li
                key={genre.slug}
                className="absolute left-0 top-0"
                style={{
                  height: itemSize.height,
                  width: itemSize.width,
                  transform: `translate(${column * (itemSize.width + gap.x)}px, ${row.start}px)`,
                }}
              >
                <GenreTicker genre={genre} />
              </li>
            );
          }),
        )}
      </ul>
    </div>
  );
}

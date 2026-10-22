import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef, useState } from "react";
import { useGenreTickers } from "../hooks/use-genre-tickers";
import { GenreTicker } from "./genre-ticker";

const BREAKPOINT = {
  xs: 375,
  sm: 640,
  lg: 1024,
};
const ITEM_RATIO = 16 / 9;

const columns = 3;
const itemSize = {
  height: 40,
  width: 300,
};

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

      setLayout({
        columns,
        itemSize: {
          height: 40,
          width: Math.max(minWidth, (width - gap.x * (columns - 1)) / columns),
        },
      });
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
    overscan: 2,
  });

  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    count: columns,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemSize.width,
    gap: gap.x,
    overscan: 2,
  });

  useEffect(() => {
    rowVirtualizer.measure();
    columnVirtualizer.measure();
  }, [itemSize.height, columns]);

  return (
    <div ref={parentRef} className="h-dvh overflow-auto">
      <ul
        ref={gridRef}
        className="relative m-0 list-none p-0"
        style={{
          height: rowVirtualizer.getTotalSize(),
          width: columnVirtualizer.getTotalSize(),
        }}
      >
        {rowVirtualizer.getVirtualItems().map((row) =>
          columnVirtualizer.getVirtualItems().map((column) => {
            const index = row.index * columns + column.index;
            const genre = genres[index];

            if (!genre) return null;

            return (
              <li
                key={genre.name}
                className="absolute left-0 top-0"
                style={{
                  height: itemSize.height,
                  width: itemSize.width,
                  transform: `translate(${column.start}px, ${row.start}px)`,
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

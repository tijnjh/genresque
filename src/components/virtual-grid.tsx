import { useVirtualizer } from "@tanstack/react-virtual";
import { ReactNode, Ref, useEffect, useRef, useState } from "react";

const gap = { x: 12, y: 12 };

export function VirtualGrid<T>({
  entries,
  children,
  gridRef,
  itemWidthInRem = 14,
}: {
  entries: T[];
  children: (entry: T) => ReactNode;
  gridRef?: Ref<HTMLUListElement>;
  itemWidthInRem?: number;
}) {
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
      const minWidth = itemWidthInRem * rem;

      const columns = Math.max(
        1,
        Math.floor((width + gap.x) / (minWidth + gap.x)),
      );

      const layout = {
        columns,
        itemSize: {
          height: 36,
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
  }, [itemWidthInRem]);

  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(entries.length / columns),
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemSize.height,
    gap: gap.y,
    overscan: 8,
    paddingEnd: 256,
  });

  return (
    <div ref={parentRef} className="h-full scrollbar-none overflow-auto">
      <ul
        ref={gridRef}
        className="relative"
        style={{
          height: rowVirtualizer.getTotalSize(),
          width: "100%",
        }}
      >
        {rowVirtualizer.getVirtualItems().flatMap((row) =>
          Array.from({ length: columns }, (_, column) => {
            const index = row.index * columns + column;
            const entry = entries[index];

            if (!entry) return;

            return (
              <li
                key={JSON.stringify(entry)}
                className="absolute"
                style={{
                  height: itemSize.height,
                  width: itemSize.width,
                  transform: `translate(${column * (itemSize.width + gap.x)}px, ${row.start}px)`,
                }}
              >
                {children(entry)}
              </li>
            );
          }),
        )}
      </ul>
    </div>
  );
}

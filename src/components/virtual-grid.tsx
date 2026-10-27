import { createVirtualizer } from "@tanstack/solid-virtual";
import { createEffect, createSignal, JSX, onCleanup, Ref } from "solid-js";

const gap = { x: 12, y: 12 };

export function VirtualGrid<T>(props: {
  entries: T[];
  children: (entry: T) => JSX.Element;
  gridRef?: Ref<HTMLUListElement>;
  itemWidthInRem?: number;
}) {
  let parent!: HTMLDivElement;

  const [layout, setLayout] = createSignal({
    columns: 1,
    itemSize: { height: 40, width: 300 },
  });

  createEffect(() => {
    if (!parent) return;

    const update = () => {
      const width = parent.clientWidth;
      const rem = parseFloat(
        getComputedStyle(document.documentElement).fontSize,
      );
      const minWidth = (props.itemWidthInRem ?? 12) * rem;

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

    onCleanup(() => observer.disconnect());
  });

  const rowVirtualizer = createVirtualizer({
    get count() {
      return Math.ceil(props.entries.length / layout().columns);
    },
    getScrollElement: () => parent,
    estimateSize: () => layout().itemSize.height,
    gap: gap.y,
    overscan: 8,
    paddingEnd: 256,
  });

  return (
    <div ref={parent} class="h-full overflow-x-hidden overflow-y-auto">
      <ul
        ref={props.gridRef}
        class="relative"
        style={{
          height: rowVirtualizer.getTotalSize() + "px",
          width: "100%",
        }}
      >
        {rowVirtualizer.getVirtualItems().flatMap((row) =>
          Array.from({ length: layout().columns }, (_, column) => {
            const index = row.index * layout().columns + column;
            const entry = props.entries[index];

            if (!entry) return;

            return (
              <li
                class="absolute"
                style={{
                  height: layout().itemSize.height + "px",
                  width: layout().itemSize.width + "px",
                  transform: `translate(${column * (layout().itemSize.width + gap.x)}px, ${row.start}px)`,
                }}
              >
                {props.children(entry)}
              </li>
            );
          }),
        )}
      </ul>
    </div>
  );
}

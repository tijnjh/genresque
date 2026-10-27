import { JSX } from "@solidjs/web";
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  onSettled,
  Ref,
} from "solid-js";
import {
  ACTION_ITEMS_LENGTH_CHANGE,
  ACTION_START_OFFSET_CHANGE,
  createContainerDriver,
  createListLayout,
  createVirtualStore,
  UPDATE_VIRTUAL_STATE,
} from "virtua/unstable_core";

const gap = { x: 12, y: 12 };
const itemHeight = 36;
const rowHeight = itemHeight + gap.y;
const paddingEnd = 256;

// using homemade virtua adapter until tanstack adds support for solidjs v2 to tanstack/virtual
// replace with https://github.com/tijnjh/genresque/blob/996c80fb73e7068b6573f82d373b2c810852f250/src/components/virtual-grid.tsx later

export function VirtualGrid<T>(props: {
  entries: T[];
  children: (entry: T) => JSX.Element;
  gridRef?: Ref<HTMLUListElement>;
  itemWidthInRem?: number;
}) {
  let parent!: HTMLDivElement;
  let container!: HTMLUListElement;
  const [viewport, setViewport] = createSignal({ width: 300, rem: 16 });

  const layout = createMemo(() => {
    const { width, rem } = viewport();
    const minWidth = (props.itemWidthInRem ?? 12) * rem;
    const columns = Math.max(
      1,
      Math.floor((width + gap.x) / (minWidth + gap.x)),
    );
    return { columns, itemWidth: (width - gap.x * (columns - 1)) / columns };
  });
  const rowCount = createMemo(() =>
    Math.ceil(props.entries.length / layout().columns),
  );

  const listLayout = createListLayout(0, rowHeight);
  const store = createVirtualStore(listLayout);
  const driver = createContainerDriver(store, listLayout, false);
  const [version, setVersion] = createSignal(0);
  let syncingCount = false;

  onSettled(() => {
    store.$subscribe(UPDATE_VIRTUAL_STATE, () => {
      if (!syncingCount) setVersion(store.$getStateVersion());
    });
    driver.$observe(container, parent);

    const measure = () => {
      const width = container.clientWidth;
      store.$update(
        ACTION_START_OFFSET_CHANGE,
        parseFloat(getComputedStyle(container.parentElement!).paddingTop),
      );
      const rem = parseFloat(
        getComputedStyle(document.documentElement).fontSize,
      );
      setViewport((previous) =>
        previous.width === width && previous.rem === rem
          ? previous
          : { width, rem },
      );
    };
    const observer = new ResizeObserver(measure);
    observer.observe(parent);
    measure();

    return () => {
      observer.disconnect();
      driver.$dispose();
      store.$dispose();
    };
  });

  createEffect(version, () => driver.$effect());

  const visible = createMemo(() => {
    version();
    // Update the external store before reading its range, so filtering and
    // column changes cannot render a frame with the previous row count.
    syncingCount = true;
    try {
      store.$update(ACTION_ITEMS_LENGTH_CHANGE, rowCount());
    } finally {
      syncingCount = false;
    }
    const [firstRow, lastRow]: [number, number] = store.$getRange(
      8 * rowHeight,
    );
    const start = firstRow * layout().columns;
    const end = Math.min(
      props.entries.length,
      (lastRow + 1) * layout().columns,
    );
    return { start, entries: props.entries.slice(start, Math.max(start, end)) };
  });

  return (
    <div ref={parent} class="h-full overflow-x-hidden overflow-y-auto">
      <div class="px-3">
        <ul
          ref={[
            (el) => {
              container = el;
            },
            props.gridRef,
          ]}
          class="relative"
          style={{
            height:
              Math.max(0, rowCount() * rowHeight - gap.y) + paddingEnd + "px",
            width: "100%",
            "overflow-anchor": "none",
          }}
        >
          <For each={visible().entries}>
            {(entry, index) => {
              const itemIndex = () => visible().start + index();
              return (
                <li
                  class="absolute"
                  style={{
                    height: itemHeight + "px",
                    width: layout().itemWidth + "px",
                    transform: `translate(${(itemIndex() % layout().columns) * (layout().itemWidth + gap.x)}px, ${Math.floor(itemIndex() / layout().columns) * rowHeight}px)`,
                  }}
                >
                  {props.children(entry)}
                </li>
              );
            }}
          </For>
        </ul>
      </div>
    </div>
  );
}

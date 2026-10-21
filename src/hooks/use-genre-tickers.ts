import { useEffect, useRef } from "react";

export function useGenreTickers(genres: readonly unknown[]) {
  const gridRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const visible = new Set<HTMLElement>();
    let measured = new WeakSet<HTMLElement>();
    let frame = 0;
    let disposed = false;

    function scheduleMeasurements() {
      if (frame || disposed) return;

      frame = requestAnimationFrame(() => {
        frame = 0;

        const measurements = Array.from(visible)
          .filter((label) => !measured.has(label))
          .map((label) => ({
            label,
            width: (label.firstElementChild as HTMLElement).offsetWidth,
            available: label.clientWidth,
          }));

        for (const { label, width, available } of measurements) {
          const distance = width + 24;
          label.style.setProperty("--ticker-distance", `-${distance}px`);
          label.style.setProperty("--ticker-duration", `${distance / 50}s`);
          label.toggleAttribute("data-overflow", width > available);
          measured.add(label);
        }
      });
    }

    const labels = grid.querySelectorAll<HTMLElement>("[data-genre-label]");

    const intersectionObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const label = entry.target as HTMLElement;
        if (entry.isIntersecting) {
          visible.add(label);
        } else {
          visible.delete(label);
        }
        label.toggleAttribute("data-visible", entry.isIntersecting);
      }

      scheduleMeasurements();
    });

    function invalidateMeasurements() {
      measured = new WeakSet<HTMLElement>();
      scheduleMeasurements();
    }

    const resizeObserver = new ResizeObserver(invalidateMeasurements);
    resizeObserver.observe(grid);

    for (const label of labels) intersectionObserver.observe(label);

    document.fonts.ready.then(() => {
      if (!disposed) invalidateMeasurements();
    });

    document.fonts.addEventListener("loadingdone", invalidateMeasurements);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      document.fonts.removeEventListener("loadingdone", invalidateMeasurements);
    };
  }, [genres]);

  return gridRef;
}

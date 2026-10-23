import { useState } from "react";

export function useEnumToggle<T extends string[]>(
  values: T,
  opts?: {
    defaultValue: T[number];
    onUpdate: (newValue: T[number]) => void;
  },
) {
  const [i, setI] = useState(
    Math.max(0, values.indexOf(opts?.defaultValue ?? "")),
  );
  const current = values[i] as T[number];

  return {
    current,
    cycle: () => {
      const next = (i + 1) % values.length;
      setI(next);
      opts?.onUpdate(values[next] as T[number]);
    },
  };
}

import { ReactNode } from "react";
import { MergeExclusive } from "type-fest";

export function Main({
  children,
  leading,
  trailing,
}: MergeExclusive<
  { children: ReactNode },
  { leading: ReactNode; trailing: ReactNode }
>) {
  return children ? (
    <main className="overflow-hidden px-3">{children}</main>
  ) : (
    <main className="h-500px grid h-full grid-cols-1 gap-3 overflow-hidden px-3 md:grid-cols-[auto_1fr]">
      <div className="pb-3 max-md:hidden">{leading}</div>
      {trailing}
    </main>
  );
}

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
    <main className="md:h-500px grid h-full grid-cols-1 gap-3 px-3 md:grid-cols-[auto_1fr] md:overflow-hidden">
      <div className="flex flex-col gap-3 pb-3">{leading}</div>
      {trailing}
    </main>
  );
}

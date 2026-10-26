import { fixRelativeUrl } from "../lib/utils";
import { Link } from "@tanstack/react-router";
import { ComponentProps, ReactNode } from "react";
import { MergeExclusive } from "type-fest";

export function Layout({
  children,
  leading,
  trailing,
  header,
}: { header: ComponentProps<typeof Header> } & MergeExclusive<
  { children?: ReactNode },
  { leading: ReactNode; trailing: ReactNode }
>) {
  return (
    <div className="grid grid-rows-[1fr_auto] overflow-hidden">
      <Header {...header} />

      <div className="grid overflow-y-auto p-3">
        {children ? (
          <main className="overflow-hidden">{children}</main>
        ) : (
          <main className="grid h-full grid-cols-1 gap-6 lg:grid-cols-[auto_1fr] lg:overflow-hidden">
            <div className="flex w-full flex-col gap-3 lg:w-72 xl:w-115">
              {leading}
            </div>
            {trailing}
          </main>
        )}
      </div>
    </div>
  );
}

export function Header({
  title,
  links,
  backHref,
  children,
}: {
  backHref?: string;
  title: string;
} & MergeExclusive<
  { links?: Array<{ text: string; href: string }> },
  { children: ReactNode }
>) {
  // we hide this button cus its too wide and doesn't provide much functionality in this case
  links = links?.filter((l) => l.text !== "Every Noise at Once");

  return (
    <header className="flex gap-3 overflow-hidden border-zinc-300-700 p-3 max-md:order-1 max-md:flex-col max-md:border-t md:h-15 md:items-center md:justify-between md:border-b">
      <div className="flex items-center gap-3">
        {backHref && (
          <Link to={backHref} className="btn-inverse size-9 justify-center">
            ←
          </Link>
        )}
        <h1 className="truncate text-2xl font-bold">{title}</h1>
      </div>

      {children ??
        (links?.length && (
          <ul className="flex scrollbar-none gap-3 overflow-x-auto">
            {links?.map((link) => (
              <li className="first:ml-3 last:mr-3" key={link.href}>
                <a
                  href={fixRelativeUrl(link.href)}
                  target="_blank"
                  className="btn-inverse"
                >
                  {link.text}
                </a>
              </li>
            ))}
          </ul>
        ))}
    </header>
  );
}

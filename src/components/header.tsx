import { fixRelativeUrl } from "../lib/utils";
import { Link, useLocation, useRouter } from "@tanstack/react-router";
import { ReactNode } from "react";
import { MergeExclusive } from "type-fest";

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

  const location = useLocation();

  return (
    <header className="flex justify-between overflow-hidden max-md:flex-col max-md:pb-3 md:items-center">
      <div className="flex items-center gap-3 p-3">
        {![location.pathname, backHref].includes("/") && (
          <Link to="/" className="btn">
            home
          </Link>
        )}
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

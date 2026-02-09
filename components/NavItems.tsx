"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { NAV_ITEMS } from "@/lib/navigation-content";
const NavItems = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";

    return pathname.startsWith(path);
  };

  return (
    <ul className="flex flex-col sm:flex-row p-2 gap-3 sm:gap-10 font-medium">
      {NAV_ITEMS.map(({ href, title }) => (
        <li key={href}>
          <Link
            href={href}
            className={`hover:text-yellow-500 transition-colors ${isActive(href) ? "text-yellow-100" : ""}`}
          >
            {title}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default NavItems;

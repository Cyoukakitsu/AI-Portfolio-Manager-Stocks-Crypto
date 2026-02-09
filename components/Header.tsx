import Link from "next/link";
import React from "react";
import Image from "next/image";
import NavItems from "./NavItems";
import UserDropdown from "./UserDropdown";

const Header = () => {
  return (
    <header className="sticky z-50 w-full h-17 bg-gray-800 top-0">
      <div className="mx-auto max-w-screen-2xl px-4 md:px-6 lg:px-8 flex justify-between items-center py-4 text-gray-500">
        <Link href="/">
          <Image
            src="/header-icon.svg"
            alt="Logo"
            width={140}
            height={32}
            className="h-8 w-auto cursor-pointer"
          />
        </Link>
        <nav className="hidden sm:block">
          <NavItems />
        </nav>
        <UserDropdown />
      </div>
      Header
    </header>
  );
};

export default Header;

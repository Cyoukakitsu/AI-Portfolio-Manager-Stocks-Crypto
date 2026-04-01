import React from "react";
import { HeaderControls } from "@/components/custom/dashboard/header-controls";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative">
      <header className="absolute top-0 right-0 flex h-14 items-center px-4 z-10">
        <HeaderControls />
      </header>
      {children}
    </div>
  );
};

export default RootLayout;

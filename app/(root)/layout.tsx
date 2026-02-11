import Header from "@/components/custom/root/Header";
import React from "react";

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="min-h-screen text-gray-400">
      <Header />
      <section className="mx-auto max-w-screen-2xl px-4 md:px-6 lg:px-8 py-10">
        {children}
      </section>
    </main>
  );
};

export default RootLayout;

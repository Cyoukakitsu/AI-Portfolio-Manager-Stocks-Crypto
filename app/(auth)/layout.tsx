import Image from "next/image";
import Link from "next/link";

const layout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <main>
      <Link href="/" className="pt-6 lg:pt-8 mb-8  lg:mb-12">
        <Image
          src="/header-icon.svg"
          alt="Logo"
          width={140}
          height={32}
          className="h-8 w-auto"
        />
      </Link>
      <section className=" flex min-h-screen items-center justify-center bg-muted">
        <div className="w-full max-w-md">{children}</div>
      </section>
    </main>
  );
};

export default layout;

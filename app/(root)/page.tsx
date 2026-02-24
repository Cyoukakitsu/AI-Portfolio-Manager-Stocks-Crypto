import Link from "next/link";
import Image from "next/image";

const Home = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted gap-8">
      <Image
        src="/header-icon.svg"
        alt="Logo"
        width={180}
        height={40}
        className="h-10 w-auto"
      />
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-gray-100">
          AI Portfolio Manager
        </h1>
        <p className="text-gray-400">
          Track your stocks and crypto with AI-powered insights.
        </p>
      </div>
      <div className="flex gap-4">
        <Link
          href="/sign-in"
          className="px-6 py-2 bg-yellow-500 text-yellow-900 font-semibold rounded-md hover:bg-yellow-400 transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/sign-up"
          className="px-6 py-2 border border-gray-600 text-gray-300 font-semibold rounded-md hover:border-yellow-500 hover:text-yellow-500 transition-colors"
        >
          Sign Up
        </Link>
      </div>
    </main>
  );
};

export default Home;

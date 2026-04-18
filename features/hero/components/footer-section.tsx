export function FooterSection() {
  return (
    <footer className="bg-[#f5f0e8] border-t border-[#c9a84c]/20 py-6 px-6">
      <div className=" border-[#c9a84c]/20 pt-6 text-center text-xs text-stone-400">
        © {new Date().getFullYear()} AI Portfolio Manager |{" "}
        <a href="#" className="hover:text-[#c9a84c] transition-colors">
          Terms
        </a>{" "}
        |{" "}
        <a href="#" className="hover:text-[#c9a84c] transition-colors">
          Privacy Policy
        </a>
      </div>
    </footer>
  );
}

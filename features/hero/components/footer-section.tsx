const footerLinks: Record<string, string[]> = {
  Features: ["Portfolio", "AI Analysis", "Market Data"],
  Links: ["Sign In", "Sign Up", "Dashboard"],
  Legal: ["Terms", "Privacy Policy"],
};

export function FooterSection() {
  return (
    <footer className="bg-[#f5f0e8] border-t border-[#c9a84c]/20 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Logo + slogan */}
          <div>
            <div className="text-xl font-bold text-[#c9a84c] mb-2">AIPM</div>
            <p className="text-xs text-stone-500">
              AI-powered portfolio management for legendary results.
            </p>
          </div>
          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <div className="text-sm font-semibold text-stone-700 mb-3">
                {category}
              </div>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-xs text-stone-500 hover:text-[#c9a84c] transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-[#c9a84c]/20 pt-6 text-center text-xs text-stone-400">
          © {new Date().getFullYear()} AI Portfolio Manager |{" "}
          <a href="#" className="hover:text-[#c9a84c] transition-colors">
            Terms
          </a>{" "}
          |{" "}
          <a href="#" className="hover:text-[#c9a84c] transition-colors">
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
}

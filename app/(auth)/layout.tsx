const layout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <main>
      <section className="w-full min-h-screen flex flex-col">
        {children}
      </section>
    </main>
  );
};

export default layout;

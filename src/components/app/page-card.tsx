type PageCardProps = {
  children: React.ReactNode;
  className?: string;
  subdued?: boolean;
};

export function PageCard({ children, className = "", subdued = false }: PageCardProps) {
  return (
    <section
      className={`rounded-2xl p-5 shadow-sm ring-1 sm:rounded-3xl sm:p-6 ${
        subdued
          ? "bg-stone-50 ring-stone-200"
          : "bg-white ring-stone-200"
      } ${className}`}
    >
      {children}
    </section>
  );
}

export function PageSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`space-y-6 ${className}`}>{children}</div>;
}

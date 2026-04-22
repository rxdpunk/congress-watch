export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-4xl">
      <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--muted)]">{eyebrow}</p>
      <h1 className="mt-4 font-serif text-4xl leading-tight text-[var(--ink)] sm:text-5xl">{title}</h1>
      <p className="mt-4 text-base leading-8 text-[var(--muted)] sm:text-lg">{description}</p>
    </div>
  );
}

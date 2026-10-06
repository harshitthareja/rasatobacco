export function ProductHoverPreview({ image }: { image?: string }) {
  if (!image) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 right-0 w-[54%] overflow-hidden opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100"
    >
      <img src={image} alt="" loading="lazy" className="h-full w-full object-cover object-center" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/50 to-transparent" />
    </div>
  );
}

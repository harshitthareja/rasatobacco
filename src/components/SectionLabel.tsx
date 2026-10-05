interface Props {
  children: React.ReactNode;
  className?: string;
}

export function SectionLabel({ children, className = "" }: Props) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <span className="h-px w-10 bg-gold/60" />
      <span className="text-[0.65rem] tracking-luxe uppercase text-gold/80">{children}</span>
    </div>
  );
}

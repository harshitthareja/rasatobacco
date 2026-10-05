import rasaLogo from "@/assets/rasa-logo.png";

interface Props {
  className?: string;
  showTag?: boolean;
  imgClassName?: string;
}

export function RasaLogo({ className = "", showTag = false, imgClassName = "h-10 w-auto" }: Props) {
  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <img
        src={rasaLogo}
        alt="RASA"
        className={imgClassName}
        loading="eager"
        decoding="async"
      />
      {showTag && (
        <span className="mt-2 font-display text-[0.6rem] md:text-xs tracking-wider text-muted-foreground uppercase">
          SMOKE, PERFECTED
        </span>
      )}
    </div>
  );
}

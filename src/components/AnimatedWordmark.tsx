import { motion } from "framer-motion";
import rasaLogo from "@/assets/rasa-logo.png";

type Props = {
  className?: string;
  size?: string;
  halo?: boolean;
  float?: boolean;
  shimmer?: boolean;
  reveal?: boolean;
};

export function AnimatedWordmark({ className = "", size = "h-24 md:h-40", halo: _halo, float: _float, shimmer: _shimmer, reveal: _reveal }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 1,
        ease: "easeOut",
      }}
      className={`relative inline-block ${className}`}
    >
      <img
        src={rasaLogo}
        alt="RASA"
        className={`w-auto ${size}`}
        loading="eager"
        decoding="async"
        draggable={false}
      />
    </motion.div>
  );
}

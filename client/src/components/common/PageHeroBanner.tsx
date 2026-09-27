import React from "react";

interface PageHeroBannerProps {
  image: string;
  alt: string;
  caption?: string;
  overlay?: "dark" | "rose";
  heightClassName?: string;
  className?: string;
}

export const PageHeroBanner: React.FC<PageHeroBannerProps> = ({
  image, alt, caption, overlay = "dark",
  heightClassName = "h-56 sm:h-72 md:h-80", className = "",
}) => {
  const gradient = overlay === "rose"
    ? "bg-gradient-to-t from-rose-950/70 via-rose-900/10 to-transparent"
    : "bg-gradient-to-t from-black/60 via-black/10 to-transparent";
  return (
    <div className={`relative rounded-2xl overflow-hidden border border-[#DDE1DE] shadow-xs mb-8 ${className}`}>
      <img src={image} alt={alt} className={`w-full ${heightClassName} object-cover`} loading="lazy" />
      <div className={`absolute inset-0 ${gradient}`} />
      {caption && (
        <span className="absolute bottom-4 left-4 sm:bottom-5 sm:left-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur text-white text-xs font-mono tracking-wide">
          {caption}
        </span>
      )}
    </div>
  );
};

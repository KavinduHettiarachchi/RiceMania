"use client";

import Image from "next/image";
import { useState } from "react";

import DishArt from "./DishArt";

interface FoodImageProps {
  src: string | null | undefined;
  name: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  steam?: boolean;
}

/**
 * Renders the uploaded photo when there is one, and falls back to the
 * generated DishArt plate on a missing or broken source — the grid never
 * shows a torn-image icon.
 */
export default function FoodImage({
  src,
  name,
  className = "",
  sizes = "(max-width: 768px) 50vw, 25vw",
  priority = false,
  steam = false,
}: FoodImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <DishArt name={name} className={className} steam={steam} />;
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={name}
        fill
        sizes={sizes}
        priority={priority}
        onError={() => setFailed(true)}
        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
      />
    </div>
  );
}

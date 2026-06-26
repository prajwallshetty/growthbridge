"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const SparklesCore = ({
  id,
  className,
  background,
  minSize,
  maxSize,
  particleDensity,
  particleColor,
}: {
  id?: string;
  className?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number;
  particleColor?: string;
}) => {
  const [particles, setParticles] = React.useState<
    Array<{ id: number; x: number; y: number; size: number; duration: number }>
  >([]);

  React.useEffect(() => {
    const density = particleDensity || 50;
    const p = Array.from({ length: density }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * ((maxSize || 2) - (minSize || 0.5)) + (minSize || 0.5),
      duration: Math.random() * 3 + 1,
    }));
    setParticles(p);
  }, [maxSize, minSize, particleDensity]);

  return (
    <div className={cn("relative w-full h-full", className)} style={{ background }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            x: [`${p.x}%`, `${p.x + (Math.random() - 0.5) * 10}%`],
            y: [`${p.y}%`, `${p.y + (Math.random() - 0.5) * 10}%`],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
          }}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: particleColor || "#FFF",
          }}
        />
      ))}
    </div>
  );
};

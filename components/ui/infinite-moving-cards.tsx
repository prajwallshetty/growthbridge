"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";

export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}: {
  items: {
    quote: string;
    name: string;
    title: string;
    profileImage?: string;
  }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);

  const [start, setStart] = useState(false);

  useEffect(() => {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      containerRef.current.style.setProperty(
        "--animation-direction",
        direction === "left" ? "forwards" : "reverse"
      );
      containerRef.current.style.setProperty(
        "--animation-duration",
        speed === "fast" ? "20s" : speed === "normal" ? "40s" : "80s"
      );
      setStart(true);
    }
  }, [direction, speed]);
  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20  max-w-7xl overflow-hidden  [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          " flex min-w-full shrink-0 gap-4 py-4 w-max flex-nowrap",
          start && "animate-scroll ",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
      >
        {items.map((item) => (
          <li
            className="w-[350px] max-w-full relative rounded-[32px] border flex-shrink-0 border-[#0D0D0D]/10 bg-[#FAFAF8] px-8 py-7 shadow-[0_18px_55px_rgba(13,13,13,0.08)] md:w-[450px]"
            key={item.name}
          >
            <blockquote>
              <div
                aria-hidden="true"
                className="user-select-none -z-1 pointer-events-none absolute -left-0.5 -top-0.5 h-[calc(100%_+_4px)] w-[calc(100%_+_4px)]"
              ></div>
              <span className="relative z-20 block text-5xl leading-none text-[#F5C242] font-semibold">
                &quot;
              </span>
              <span className=" relative z-20 text-base leading-[1.7] text-[#0D0D0D] font-normal">
                {item.quote}
              </span>
              <div className="relative z-20 mt-7 flex flex-row items-center gap-4">
                {item.profileImage ? (
                  <img
                    src={item.profileImage}
                    alt=""
                    className="h-12 w-12 rounded-full object-cover border-2 border-[#F5C242]"
                  />
                ) : null}
                <span className="flex flex-col gap-1">
                  <span className=" text-sm leading-[1.6] text-[#0D0D0D] font-semibold">
                    {item.name}
                  </span>
                  <span className=" text-sm leading-[1.6] text-[#0D0D0D]/60 font-normal">
                    {item.title}
                  </span>
                </span>
              </div>
            </blockquote>
          </li>
        ))}
      </ul>
    </div>
  );
};

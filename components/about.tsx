"use client";

import Image from "next/image";
import { m, useReducedMotion } from "framer-motion";

export function About() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <m.section
      id="about"
      className="pt-24 pb-24 will-change-[transform,opacity]"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative mx-auto max-w-6xl px-6">
        {/* Ambient glow (no card) */}
        <div className="pointer-events-none absolute -inset-x-12 -top-8 -bottom-8 opacity-60">
          <div className="mx-auto h-full max-w-3xl rounded-[28px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent blur-2xl" />
        </div>

        <div className="relative z-10 text-center">
          {/* Avatar with gradient ring */}
          <div
            className="mx-auto mb-8 size-36 rounded-full p-[2px] md:mb-10 md:size-44"
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--muted-foreground)) 100%)",
            }}
          >
            <div className="size-full overflow-hidden rounded-full bg-background ring-1 ring-border">
              <Image
                src="/ted-aboutme.jpg"
                alt="Portrait of Ted"
                width={176}
                height={176}
                className="size-full object-cover object-[center_top]"
                style={{ objectPosition: '50% 30%' }}
                sizes="(max-width: 768px) 288px, 352px"
                quality={90}
              />
            </div>
          </div>

          {/* Copy */}
          <div className="mx-auto max-w-prose space-y-5 text-left text-foreground text-lg md:text-xl leading-relaxed md:space-y-6">
            <p className="text-foreground">
              Hi, I&apos;m Teddy and I&apos;m a Computer Science student at Simon Fraser Unversity, focused on distributed systems, infrastructure and product engineering.
            </p>
            <p className="text-foreground">
              For me, programming is all about building and fixing. I love working on solutions that solve real problems while being scalable and reliable.
            </p>
            <p className="text-foreground">
              In my free time, I love to play badminton, lift weights, and geek out over how large-scale systems are built. If you&apos;re building something interesting or want to chat, feel free to reach out!
            </p>

          </div>
        </div>
      </div>
    </m.section>
  );
}

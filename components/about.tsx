"use client";

import Image from "next/image";
import { m, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

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
              Hi, I&apos;m Teddy and I&apos;m a Computer Science student at Simon Fraser Unversity, focused on building scalable and reliable infrastructure to serve millions of users.
            </p>
            <p className="text-foreground">
              I like to read articles about AI &amp; infra on{" "}
              <a
                href="https://news.ycombinator.com"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-baseline gap-0.5 underline decoration-border/50 underline-offset-4 hover:decoration-primary/50"
              >
                Hacker News
                <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
              </a>{" "}
              and{" "}
              <a
                href="https://x.com/teddymalhan"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-baseline gap-0.5 underline decoration-border/50 underline-offset-4 hover:decoration-primary/50"
              >
                X
                <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
              </a>{" "}, and I enjoy playing table tennis, lifting weights & geeking out over how large scale systems are built.
            </p>
            <p className="text-foreground">
              If you&apos;re building something interesting or want to chat, feel free to reach out!
            </p>

          </div>
        </div>
      </div>
    </m.section>
  );
}

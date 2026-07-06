"use client";

import Link from "next/link";
import { Mail, Github, Linkedin } from "lucide-react";
import { m, useReducedMotion } from "framer-motion";
import { useNavigationStore } from "@/stores";
import { usePortfolioSounds } from "@/components/sound-effects";

export default function Footer({
  isResumeVisible,
}: {
  isResumeVisible: boolean;
}) {
  const resumePath = useNavigationStore((state) => state.resumePath);
  const prefersReducedMotion = useReducedMotion();
  const { playClick, playSend, playTabSwitch } = usePortfolioSounds();

  return (
    <m.footer
      className="relative mx-auto w-full max-w-6xl px-6 py-10 md:py-14 will-change-[transform,opacity]"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
    >
      {/* Ambient glow (match About section) */}
      <div className="pointer-events-none absolute -inset-x-12 -top-8 -bottom-8 opacity-60">
        <div className="mx-auto h-full max-w-6xl rounded-[28px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent blur-2xl" />
      </div>
      <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="font-sans text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
            Teddy Malhan
          </h3>
          <Link
            href="mailto:ama367@sfu.ca"
            onClick={playSend}
            className="mt-2 block text-base md:text-lg text-foreground/90 hover:text-foreground underline decoration-border/50 hover:decoration-primary/50 underline-offset-4"
          >
            ama367@sfu.ca
          </Link>

          <div className="mt-5 flex gap-2">
            <Link
              href="mailto:ama367@sfu.ca"
              aria-label="Email"
              onClick={playSend}
              className="fill rounded-md p-2"
            >
              <Mail className="w-5 h-5" />
            </Link>
            <Link
              href="https://github.com/teddymalhan"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="GitHub"
              onClick={playClick}
              className="fill rounded-md p-2"
            >
              <Github className="w-5 h-5" />
            </Link>
            <Link
              href="https://www.linkedin.com/in/teddymalhan/"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="LinkedIn"
              onClick={playClick}
              className="fill rounded-md p-2"
            >
              <Linkedin className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <nav className="grid grid-cols-2 gap-6 text-sm md:grid-cols-3">
          <div className="flex flex-col gap-2">
            <p className="font-medium text-foreground">Site</p>
            <Link
              href="#projects"
              onClick={playTabSwitch}
              className="text-muted-foreground hover:text-foreground"
            >
              Projects
            </Link>
            <Link
              href="#experience"
              onClick={playTabSwitch}
              className="text-muted-foreground hover:text-foreground"
            >
              Experience
            </Link>
            <Link
              href="#contact"
              onClick={playTabSwitch}
              className="text-muted-foreground hover:text-foreground"
            >
              Contact
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-medium text-foreground">Social</p>
            <Link
              href="https://github.com/teddymalhan"
              target="_blank"
              rel="noreferrer noopener"
              className="text-muted-foreground hover:text-foreground"
              onClick={playClick}
            >
              GitHub
            </Link>
            <Link
              href="https://www.linkedin.com/in/teddymalhan/"
              target="_blank"
              rel="noreferrer noopener"
              onClick={playClick}
              className="text-muted-foreground hover:text-foreground"
            >
              LinkedIn
            </Link>
            <Link
              href="mailto:ama367@sfu.ca"
              className="text-muted-foreground hover:text-foreground"
              onClick={playSend}
            >
              Email
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-medium text-foreground">More</p>
            {isResumeVisible && (
              <Link
                href={resumePath}
                target="_blank"
                rel="noreferrer noopener"
                onClick={(e) => {
                  e.preventDefault();
                  const freshUrl = resumePath.includes("&t=")
                    ? `${resumePath.split("&t=")[0]}&t=${Date.now()}`
                    : `${resumePath}?t=${Date.now()}`;
                  playClick();
                  window.open(freshUrl, "_blank", "noopener,noreferrer");
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                Resume
              </Link>
            )}
            <Link
              href="#about"
              onClick={playTabSwitch}
              className="text-muted-foreground hover:text-foreground"
            >
              About
            </Link>
            <Link
              href="https://cal.com/teddymalhan"
              target="_blank"
              rel="noreferrer noopener"
              onClick={playClick}
              className="text-muted-foreground hover:text-foreground"
            >
              Book a Call
            </Link>
          </div>
        </nav>
      </div>
    </m.footer>
  );
}


"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

const floatingBits = [
  { symbol: "✳", left: "5%", top: "16%", color: "#e83e57", delay: 0 },
  { symbol: "♥", left: "83%", top: "12%", color: "#e83e57", delay: 0.4 },
  { symbol: "✦", left: "88%", top: "64%", color: "#7651c8", delay: 0.8 },
  { symbol: "★", left: "8%", top: "73%", color: "#b17c00", delay: 1.2 },
];

export default function Home() {
  const [opened, setOpened] = useState(false);
  const reduceMotion = useReducedMotion();

  return (
    <main className="overflow-hidden bg-[#fff5e7] text-[#2b1720]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-10">
        <Link href="/" className="party-display text-2xl">
          partybox<span className="text-[#e83e57]">!</span>
        </Link>

        <Link
          href="/create"
          className="rounded-full border-2 border-[#2b1720] bg-white px-4 py-2.5 text-sm font-extrabold transition hover:-rotate-2 hover:bg-[#ffd45d]"
        >
          Make a box ↗
        </Link>
      </nav>

      <section className="party-paper relative mx-3 overflow-hidden rounded-[32px] border-2 border-[#2b1720] sm:mx-6 sm:rounded-[44px]">
        <div className="mx-auto grid min-h-[660px] max-w-7xl items-center gap-4 px-6 py-12 sm:px-12 lg:grid-cols-2 lg:px-16 lg:py-16">
          <div className="party-enter relative z-10">
            <span className="party-sticker rotate-[-4deg] bg-[#bce9d4]">
              A tiny internet party
            </span>

            <h1 className="party-display mt-7 max-w-2xl text-6xl sm:text-7xl lg:text-[92px]">
              MAKE
              <br />
              SOMEONE&apos;S
              <br />
              <span className="relative inline-block text-[#e83e57]">
                DAY.
                <svg
                  aria-hidden="true"
                  className="absolute -bottom-3 left-0 w-full"
                  viewBox="0 0 220 18"
                  fill="none"
                >
                  <path
                    d="M3 12 Q80 1 216 8"
                    stroke="#ff674d"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-8 max-w-md text-lg font-medium leading-8 text-[#795e62] sm:text-xl">
              Their favorite people. Your inside jokes. A little surprise
              they&apos;ll want to keep forever.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/create"
                className="party-button inline-flex items-center gap-3"
              >
                Make them a PartyBox <span aria-hidden="true">↗</span>
              </Link>
              <span className="text-sm font-bold text-[#795e62]">
                Free to make. Made with love.
              </span>
            </div>

            <div className="mt-10 flex items-center gap-3">
              <div className="flex -space-x-2">
                <span className="grid size-9 place-items-center rounded-full border-2 border-[#2b1720] bg-[#ffd45d]">☺</span>
                <span className="grid size-9 place-items-center rounded-full border-2 border-[#2b1720] bg-[#d9c5ff]">♥</span>
                <span className="grid size-9 place-items-center rounded-full border-2 border-[#2b1720] bg-[#bce9d4]">✿</span>
              </div>
              <p className="text-sm font-bold text-[#795e62]">
                Made for your kind of people.
              </p>
            </div>
          </div>

          <div className="relative mx-auto flex w-full max-w-[500px] items-center justify-center py-10">
            {floatingBits.map((bit) => (
              <motion.span
                key={bit.symbol + bit.left}
                aria-hidden="true"
                className="absolute z-20 text-4xl sm:text-5xl"
                style={{ left: bit.left, top: bit.top, color: bit.color }}
                animate={
                  reduceMotion
                    ? undefined
                    : {
                        y: [0, -16, 0],
                        rotate: [-10, 12, -10],
                      }
                }
                transition={{
                  duration: 3.2,
                  delay: bit.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {bit.symbol}
              </motion.span>
            ))}

            <motion.button
              type="button"
              aria-label={opened ? "Close the gift" : "Open the gift"}
              aria-pressed={opened}
              onClick={() => setOpened((value) => !value)}
              className="relative flex aspect-square w-full max-w-[360px] items-center justify-center rounded-full bg-[#ffd45d] outline-offset-8"
              whileHover={reduceMotion ? undefined : { scale: 1.035, rotate: -2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.96 }}
            >
              <div className="absolute inset-4 rounded-full border-2 border-dashed border-[#2b1720]/20" />

              {opened && (
                <motion.div
                  aria-hidden="true"
                  className="absolute inset-0 z-30"
                  initial={reduceMotion ? undefined : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {Array.from({ length: 14 }, (_, index) => (
                    <span
                      key={index}
                      className="party-confetti absolute text-2xl font-black"
                      style={{
                        left: `${(index * 37 + 9) % 92}%`,
                        top: `${(index * 23 + 7) % 76}%`,
                        color: ["#e83e57", "#7651c8", "#2b1720", "#ff674d"][
                          index % 4
                        ],
                        animationDelay: `${(index % 5) * 70}ms`,
                      }}
                    >
                      {["✦", "♥", "✳", "★"][index % 4]}
                    </span>
                  ))}
                </motion.div>
              )}

              <div className="relative mt-10 h-48 w-56 sm:h-56 sm:w-64">
                <div className="absolute bottom-0 h-36 w-full rounded-b-2xl border-[3px] border-[#2b1720] bg-[#ff674d] shadow-[8px_8px_0_#2b1720]">
                  <div className="absolute left-1/2 h-full w-12 -translate-x-1/2 border-x-[3px] border-[#2b1720] bg-[#ffd45d]" />
                </div>

                <motion.div
                  className="absolute -top-4 left-[-8px] z-10 h-16 w-[calc(100%+16px)] rounded-xl border-[3px] border-[#2b1720] bg-[#e83e57] shadow-[4px_5px_0_#2b1720]"
                  animate={
                    opened && !reduceMotion
                      ? { y: -115, rotate: -15, x: 28 }
                      : { y: 0, rotate: 0, x: 0 }
                  }
                  transition={{ type: "spring", stiffness: 160, damping: 12 }}
                >
                  <div className="absolute left-1/2 h-full w-12 -translate-x-1/2 border-x-[3px] border-[#2b1720] bg-[#ffd45d]" />
                </motion.div>

                <div className="absolute -top-20 left-1/2 z-20 flex -translate-x-1/2 items-center justify-center">
                  <motion.span
                    className="party-display text-7xl text-[#e83e57] sm:text-8xl"
                    animate={
                      reduceMotion
                        ? undefined
                        : { rotate: [-9, 9, -9], y: [0, -4, 0] }
                    }
                    transition={{ duration: 2.4, repeat: Infinity }}
                  >
                    ♡
                  </motion.span>
                </div>
              </div>

              <span className="absolute bottom-7 rounded-full border-2 border-[#2b1720] bg-white px-4 py-2 text-xs font-black uppercase tracking-wider">
                {opened ? "Surprise! ✨" : "Psst... tap me"}
              </span>
            </motion.button>

            <span className="party-sticker party-float absolute -bottom-1 left-1 rotate-[-9deg] bg-[#d9c5ff]">
              BIG FEELINGS
            </span>
            <span className="party-sticker party-wiggle absolute right-0 top-2 rotate-[8deg] bg-[#bce9d4]">
              100% YOU
            </span>
          </div>
        </div>

        <div className="border-t-2 border-[#2b1720] bg-[#ffd45d] px-5 py-4">
          <p className="text-center text-xs font-black uppercase tracking-[0.18em] sm:text-sm">
            Not another boring group chat · A little something to keep
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-12 sm:py-28">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <span className="party-sticker rotate-[-3deg] bg-[#d9c5ff]">
              The good stuff
            </span>
            <h2 className="party-display mt-6 max-w-2xl text-5xl sm:text-7xl">
              GROUP CHAT ENERGY.
              <br />
              <span className="text-[#e83e57]">GIFT BOX MAGIC.</span>
            </h2>
          </div>
          <p className="max-w-xs text-base font-medium leading-7 text-[#795e62]">
            All the little things that say “I know you” in one happy place.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          <motion.article
            whileHover={reduceMotion ? undefined : { y: -8, rotate: -1 }}
            className="party-card relative overflow-hidden bg-[#ff674d] p-6"
          >
            <span className="text-6xl" aria-hidden="true">💌</span>
            <h3 className="party-display mt-10 text-3xl">THE LOVE NOTES</h3>
            <p className="mt-3 leading-7">
              Messages from the people who know your lore.
            </p>
            <span className="absolute right-5 top-5 text-2xl" aria-hidden="true">✳</span>
          </motion.article>

          <motion.article
            whileHover={reduceMotion ? undefined : { y: -8, rotate: 1 }}
            className="party-card relative overflow-hidden bg-[#d9c5ff] p-6"
          >
            <span className="text-6xl" aria-hidden="true">🎤</span>
            <h3 className="party-display mt-10 text-3xl">THE VOICE NOTES</h3>
            <p className="mt-3 leading-7">
              Their laugh. That story. The voice you&apos;d recognize anywhere.
            </p>
            <span className="absolute right-5 top-5 text-2xl" aria-hidden="true">♫</span>
          </motion.article>

          <motion.article
            whileHover={reduceMotion ? undefined : { y: -8, rotate: -1 }}
            className="party-card relative overflow-hidden bg-[#bce9d4] p-6"
          >
            <span className="text-6xl" aria-hidden="true">🎁</span>
            <h3 className="party-display mt-10 text-3xl">THE BIG REVEAL</h3>
            <p className="mt-3 leading-7">
              One link. One little surprise. A memory they can come back to.
            </p>
            <span className="absolute right-5 top-5 text-2xl" aria-hidden="true">★</span>
          </motion.article>
        </div>
      </section>

      <section className="mx-3 mb-5 overflow-hidden rounded-[32px] border-2 border-[#2b1720] bg-[#2b1720] px-6 py-16 text-center text-[#fff5e7] sm:mx-6 sm:rounded-[44px] sm:px-12 sm:py-24">
        <span className="party-sticker rotate-[-3deg] border-white/40 bg-[#ffd45d] text-[#2b1720]">
          Your people are waiting
        </span>
        <h2 className="party-display mx-auto mt-8 max-w-4xl text-5xl sm:text-7xl">
          OKAY, WHO&apos;S GETTING ONE?
        </h2>
        <p className="mx-auto mt-6 max-w-xl leading-7 text-white/70">
          Your bestie. Your sibling. The friend who says they don&apos;t want
          anything but absolutely deserves everything.
        </p>
        <Link
          href="/create"
          className="mt-9 inline-flex rounded-full border-2 border-[#2b1720] bg-[#ffd45d] px-7 py-4 font-black text-[#2b1720] transition hover:-rotate-2 hover:scale-105"
        >
          Make their day ↗
        </Link>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-3 px-7 py-6 text-sm font-bold text-[#795e62] sm:px-12">
        <Link href="/" className="party-display text-xl text-[#2b1720]">
          partybox!
        </Link>
        <p>A tiny corner of the internet, made with love.</p>
      </footer>
    </main>
  );
}

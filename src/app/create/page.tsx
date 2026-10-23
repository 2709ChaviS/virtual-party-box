
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { supabase } from "@/lib/supabase";

const themes = [
  { id: "midnight", name: "Midnight", color: "#d9c5ff", emoji: "🌙" },
  { id: "sunset", name: "Sunset", color: "#ffb7a6", emoji: "🍒" },
  { id: "dreamy", name: "Dreamy", color: "#f7b9e5", emoji: "🦋" },
  { id: "ocean", name: "Ocean", color: "#a8dafa", emoji: "🌊" },
];

const occasions = [
  "Birthday",
  "Farewell",
  "Graduation",
  "Anniversary",
  "Achievement",
  "Just Because",
];

export default function CreatePartyPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [recipient, setRecipient] = useState("");
  const [occasion, setOccasion] = useState("Birthday");
  const [theme, setTheme] = useState("sunset");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const selectedTheme = themes.find((item) => item.id === theme) || themes[1];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const nickname = recipient.trim();

    if (!nickname) {
      setError("Every great gift needs a name. Add a nickname first!");
      return;
    }

    setSaving(true);

    try {
      const { data, error: dbError } = await supabase.rpc("create_party", {
        p_recipient: nickname,
        p_occasion: occasion,
        p_theme: theme,
      });

      if (dbError) throw dbError;

      const party = Array.isArray(data) ? data[0] : data;

      if (!party?.id || !party?.manage_token) {
        throw new Error("Your PartyBox wasn't created. Please try again.");
      }

      localStorage.setItem(`partybox-manage-${party.id}`, party.manage_token);
      router.push(`/party/${party.id}`);
    } catch (err) {
      console.error("Party creation failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Give it another try!"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="party-paper min-h-screen px-4 py-5 text-[#2b1720] sm:px-8">
      <nav className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="party-display text-2xl">
          partybox<span className="text-[#e83e57]">!</span>
        </Link>
        <Link href="/" className="text-sm font-bold underline underline-offset-4">
          ← Back home
        </Link>
      </nav>

      <div className="mx-auto mt-10 grid max-w-6xl gap-8 lg:grid-cols-[1fr_0.8fr] lg:gap-14">
        <section className="party-enter">
          <span className="party-sticker rotate-[-3deg] bg-[#bce9d4]">
            Step 01 · The person
          </span>
          <h1 className="party-display mt-7 text-5xl sm:text-7xl">
            LET&apos;S
            <br />
            MAKE A
            <br />
            <span className="text-[#e83e57]">FUSS.</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-[#795e62]">
            Pick your person. Pick the vibe. We&apos;ll make a little corner of
            the internet just for them.
          </p>

          <form onSubmit={handleSubmit} className="mt-9 space-y-8">
            <div>
              <label htmlFor="recipient" className="block text-lg font-black">
                1. Who&apos;s the main character?
              </label>
              <input
                id="recipient"
                className="party-input mt-3"
                value={recipient}
                onChange={(event) => setRecipient(event.target.value)}
                maxLength={50}
                required
                placeholder="Their nickname, please..."
              />
              <p className="mt-2 text-xs font-medium text-[#795e62]">
                Nickname only. Save the super-personal stuff for real life.
              </p>
            </div>

            <fieldset>
              <legend className="text-lg font-black">
                2. What&apos;s the occasion?
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {occasions.map((item) => (
                  <button
                    type="button"
                    key={item}
                    aria-pressed={occasion === item}
                    onClick={() => setOccasion(item)}
                    className={`rounded-full border-2 border-[#2b1720] px-4 py-2.5 text-sm font-bold transition ${
                      occasion === item
                        ? "bg-[#2b1720] text-white"
                        : "bg-white hover:-translate-y-0.5 hover:bg-[#ffd45d]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-lg font-black">
                3. Pick their vibe.
              </legend>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {themes.map((item) => (
                  <motion.button
                    type="button"
                    key={item.id}
                    aria-pressed={theme === item.id}
                    onClick={() => setTheme(item.id)}
                    whileTap={reduceMotion ? undefined : { scale: 0.94 }}
                    className={`rounded-2xl border-2 border-[#2b1720] p-3 text-left transition ${
                      theme === item.id
                        ? "shadow-[3px_4px_0_#2b1720]"
                        : "hover:-translate-y-1"
                    }`}
                    style={{ backgroundColor: item.color }}
                  >
                    <span className="block text-3xl">{item.emoji}</span>
                    <span className="mt-4 block text-sm font-black">
                      {item.name}
                    </span>
                    {theme === item.id && (
                      <span className="mt-1 block text-xs font-bold">
                        That&apos;s the one ✓
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>
            </fieldset>

            {error && (
              <p role="alert" className="rounded-2xl border-2 border-[#e83e57] bg-white p-4 text-sm font-bold text-[#b72a42]">
                {error}
              </p>
            )}

            <button type="submit" disabled={saving} className="party-button w-full disabled:opacity-60">
              {saving ? "Wrapping your PartyBox..." : "Make the magic happen ↗"}
            </button>
            <p className="text-center text-xs font-medium text-[#795e62]">
              Free to create. No wallet, no payments, just people.
            </p>
          </form>
        </section>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="party-sticker relative z-10 ml-4 rotate-[5deg] bg-[#ffd45d]">
            A little sneak peek
          </div>

          <motion.div
            key={theme + occasion}
            initial={reduceMotion ? undefined : { opacity: 0, y: 12, rotate: 2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            className="party-card mt-4 overflow-hidden"
          >
            <div
              className="relative flex min-h-[340px] flex-col items-center justify-center overflow-hidden px-6 py-10 text-center"
              style={{ backgroundColor: selectedTheme.color }}
            >
              <span className="absolute left-5 top-5 rotate-[-12deg] text-4xl" aria-hidden="true">✳</span>
              <span className="absolute right-6 top-9 rotate-[12deg] text-4xl" aria-hidden="true">♥</span>
              <span className="party-display text-6xl sm:text-7xl" aria-hidden="true">🎁</span>
              <p className="mt-6 text-xs font-black uppercase tracking-[0.2em]">
                {occasion} memories
              </p>
              <h2 className="party-display mt-4 break-words text-4xl sm:text-5xl">
                {recipient.trim() || "YOUR PERSON"}!
              </h2>
              <p className="mt-4 max-w-xs text-sm font-semibold leading-6">
                A tiny internet surprise, made by your people.
              </p>
              <span className="party-sticker mt-6 rotate-[-3deg] bg-white">
                Made with ♥
              </span>
            </div>
            <div className="bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-black">Your box is taking shape</span>
                <span className="rounded-full bg-[#bce9d4] px-3 py-1 text-xs font-black">
                  LIVE PREVIEW
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-[#795e62]">
                You&apos;ll get a shareable link to send to all their favorite people.
              </p>
            </div>
          </motion.div>
          <p className="mt-5 text-center text-xs font-bold text-[#795e62]">
            The real magic starts when everyone adds a little something.
          </p>
        </aside>
      </div>
    </main>
  );
}

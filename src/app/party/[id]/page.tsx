
"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { supabase } from "@/lib/supabase";

type Party = {
  id: string;
  recipient: string;
  occasion: string;
  theme: string;
  created_at: string;
};

type GuestMessage = {
  id: string;
  guest_name: string;
  message: string;
  created_at: string;
};

const palettes: Record<string, { background: string; sticker: string }> = {
  midnight: { background: "#d9c5ff", sticker: "#fff5e7" },
  sunset: { background: "#ffb7a6", sticker: "#ffd45d" },
  dreamy: { background: "#f7b9e5", sticker: "#bce9d4" },
  ocean: { background: "#a8dafa", sticker: "#fff5e7" },
};

export default function PartyPage() {
  const reduceMotion = useReducedMotion();
  const [party, setParty] = useState<Party | null>(null);
  const [messages, setMessages] = useState<GuestMessage[]>([]);
  const [pending, setPending] = useState<GuestMessage[]>([]);
  const [partyId, setPartyId] = useState("");
  const [manageToken, setManageToken] = useState("");
  const [origin, setOrigin] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [moderatingId, setModeratingId] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestMessage, setGuestMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [moderationError, setModerationError] = useState("");
  const [reveal, setReveal] = useState(false);

  const loadMessages = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from("messages")
      .select("id, guest_name, message, created_at")
      .eq("party_id", id)
      .eq("approved", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Unable to load wishes:", error);
      return;
    }

    setMessages((data || []) as GuestMessage[]);
  }, []);

  const loadPending = useCallback(async (id: string, token: string) => {
    const { data, error } = await supabase.rpc("get_pending_messages", {
      p_party_id: id,
      p_manage_token: token,
    });

    if (error) {
      console.error("Unable to load pending wishes:", error);
      setModerationError("Organizer access could not be verified.");
      return;
    }

    setModerationError("");
    setPending((data || []) as GuestMessage[]);
  }, []);

  useEffect(() => {
    let active = true;

    async function initialize() {
      const id = window.location.pathname.split("/").filter(Boolean).pop() || "";
      const token = localStorage.getItem(`partybox-manage-${id}`) || "";

      setOrigin(window.location.origin);
      setPartyId(id);
      setManageToken(token);

      try {
        const { data, error } = await supabase.rpc("get_party", { p_id: id });
        if (error) throw error;

        const found = Array.isArray(data) ? data[0] : data;

        if (active && found) {
          setParty(found as Party);
          await loadMessages(id);
          if (token) await loadPending(id, token);
        }
      } catch (err) {
        console.error("Unable to load PartyBox:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    initialize();

    return () => {
      active = false;
    };
  }, [loadMessages, loadPending]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/party/${partyId}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Copy didn't work. You can copy the URL from your browser.");
    }
  }

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    const name = guestName.trim();
    const content = guestMessage.trim();

    if (name.length < 1 || name.length > 50) {
      setError("Your nickname must be between 1 and 50 characters.");
      return;
    }

    if (content.length < 1 || content.length > 500) {
      setError("Your wish must be between 1 and 500 characters.");
      return;
    }

    setSending(true);

    try {
      const { error } = await supabase.rpc("submit_guest_message", {
        p_party_id: partyId,
        p_guest_name: name,
        p_message: content,
      });

      if (error) throw error;

      setGuestName("");
      setGuestMessage("");
      setNotice("Your wish is in! The organizer will review it before it appears.");
      if (manageToken) await loadPending(partyId, manageToken);
    } catch (err) {
      console.error("Wish submission failed:", err);
      setError("We couldn't send that wish. Please try again.");
    } finally {
      setSending(false);
    }
  }

  async function moderate(id: string, action: "approve" | "delete") {
    if (!manageToken) return;

    setModeratingId(id);
    setModerationError("");

    try {
      const { error } = await supabase.rpc("moderate_message", {
        p_party_id: partyId,
        p_manage_token: manageToken,
        p_message_id: id,
        p_action: action,
      });

      if (error) throw error;
      await loadPending(partyId, manageToken);
      await loadMessages(partyId);
    } catch (err) {
      console.error("Moderation failed:", err);
      setModerationError("That action didn't work. Please try again.");
    } finally {
      setModeratingId("");
    }
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#fff5e7] font-bold text-[#2b1720]">
        Getting the confetti ready...
      </main>
    );
  }

  if (!party) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#fff5e7] px-6 text-center text-[#2b1720]">
        <div>
          <p className="party-display text-5xl">OOPS!</p>
          <p className="mt-4">We couldn't find this PartyBox.</p>
          <Link href="/create" className="party-button mt-6 inline-block">
            Make a new one ↗
          </Link>
        </div>
      </main>
    );
  }

  const palette = palettes[party.theme] || palettes.sunset;

  return (
    <main className="party-paper min-h-screen px-3 py-4 text-[#2b1720] sm:px-6 sm:py-7">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-2">
        <Link href="/" className="party-display text-2xl">
          partybox<span className="text-[#e83e57]">!</span>
        </Link>
        <button
          type="button"
          onClick={copyLink}
          className="rounded-full border-2 border-[#2b1720] bg-white px-4 py-2.5 text-sm font-black transition hover:-rotate-2 hover:bg-[#ffd45d]"
        >
          {copied ? "Copied! ✓" : "Invite your people ↗"}
        </button>
      </nav>

      <section
        className="relative mx-auto mt-6 max-w-5xl overflow-hidden rounded-[30px] border-2 border-[#2b1720] px-5 py-12 text-center sm:rounded-[42px] sm:px-12 sm:py-16"
        style={{ backgroundColor: palette.background }}
      >
        <span className="absolute left-5 top-5 rotate-[-12deg] text-4xl sm:left-10 sm:top-10 sm:text-6xl" aria-hidden="true">✳</span>
        <span className="absolute right-5 top-6 rotate-[15deg] text-4xl sm:right-12 sm:top-12 sm:text-6xl" aria-hidden="true">♥</span>
        <span className="party-sticker relative z-10 rotate-[-3deg] bg-white">
          {party.occasion} special
        </span>

        <motion.div
          className="mx-auto mt-8 text-7xl sm:text-8xl"
          aria-hidden="true"
          animate={reduceMotion ? undefined : { y: [0, -8, 0], rotate: [-4, 4, -4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          🎁
        </motion.div>

        <h1 className="party-display relative z-10 mt-6 break-words text-5xl sm:text-7xl lg:text-8xl">
          IT&apos;S ALL
          <br />
          FOR <span className="text-[#e83e57]">{party.recipient.toUpperCase()}!</span>
        </h1>

        <p className="mx-auto mt-6 max-w-lg text-base font-semibold leading-7 sm:text-lg">
          A little corner of the internet, filled with the people who make life
          more fun. Add your wish and make this box theirs.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => document.getElementById("leave-a-wish")?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" })}
            className="party-button"
          >
            Leave a little love ↓
          </button>
          <button
            type="button"
            onClick={() => setReveal((value) => !value)}
            className="party-button party-button-light"
          >
            {reveal ? "Close the surprise" : "Open a tiny surprise ✨"}
          </button>
        </div>

        {reveal && (
          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, scale: 0.85, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="party-card mx-auto mt-8 max-w-md bg-white p-6"
          >
            <p className="text-4xl" aria-hidden="true">💌</p>
            <h2 className="party-display mt-4 text-3xl">YOU ARE VERY LOVED.</h2>
            <p className="mt-3 leading-7">
              This little box is a reminder that your people are thinking of you.
              More surprises are on their way!
            </p>
          </motion.div>
        )}

        <div className="party-sticker absolute bottom-4 left-4 hidden rotate-[-8deg] bg-[#bce9d4] sm:inline-flex">
          made with love
        </div>
        <div className="party-sticker absolute bottom-4 right-4 hidden rotate-[7deg] bg-[#ffd45d] sm:inline-flex">
          good people only
        </div>
      </section>

      <section id="leave-a-wish" className="mx-auto mt-8 grid max-w-5xl items-start gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="party-card relative mt-3 bg-white p-6 sm:p-8">
          <span className="party-tape" aria-hidden="true" />
          <span className="party-sticker rotate-[-3deg] bg-[#ffd45d]">Drop a note</span>
          <h2 className="party-display mt-6 text-4xl sm:text-5xl">SAY THE THING.</h2>
          <p className="mt-4 leading-7 text-[#795e62]">
            The sweet thing. The silly thing. The story only you two understand.
          </p>

          <form onSubmit={submitMessage} className="mt-6 space-y-4">
            <div>
              <label htmlFor="guestName" className="text-sm font-black">Your name / nickname</label>
              <input
                id="guestName"
                className="party-input mt-2"
                value={guestName}
                onChange={(event) => setGuestName(event.target.value)}
                maxLength={50}
                required
                placeholder="The iconic you"
              />
            </div>

            <div>
              <label htmlFor="guestMessage" className="text-sm font-black">Your little message</label>
              <textarea
                id="guestMessage"
                className="party-input mt-2"
                value={guestMessage}
                onChange={(event) => setGuestMessage(event.target.value)}
                maxLength={500}
                rows={4}
                required
                placeholder="Remember that time we..."
              />
              <p className="mt-1 text-right text-xs font-bold text-[#795e62]">
                {guestMessage.length}/500
              </p>
            </div>

            {error && <p role="alert" className="rounded-xl bg-[#ffe0e2] p-3 text-sm font-bold text-[#a51f37]">{error}</p>}
            {notice && <p role="status" className="rounded-xl bg-[#bce9d4] p-3 text-sm font-bold">{notice}</p>}

            <button type="submit" disabled={sending} className="party-button w-full disabled:opacity-60">
              {sending ? "Sending your love..." : "Send that wish ♥"}
            </button>
            <p className="text-xs leading-5 text-[#795e62]">
              Wishes are reviewed by the organizer before they appear publicly.
            </p>
          </form>
        </div>

        <div>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="party-sticker rotate-[2deg] bg-[#d9c5ff]">The good stuff</span>
              <h2 className="party-display mt-5 text-4xl sm:text-5xl">THE LOVE WALL.</h2>
            </div>
            <span className="rounded-full border-2 border-[#2b1720] bg-white px-3 py-2 text-xs font-black">
              {messages.length} {messages.length === 1 ? "WISH" : "WISHES"}
            </span>
          </div>

          {messages.length === 0 ? (
            <div className="party-card mt-6 rotate-[1deg] bg-[#bce9d4] p-8 text-center">
              <p className="text-5xl" aria-hidden="true">🪄</p>
              <h3 className="party-display mt-4 text-3xl">THIS WALL IS WAITING.</h3>
              <p className="mt-3 leading-7">Be the first to leave a little love. Approved wishes will pop up here.</p>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {messages.map((item, index) => (
                <motion.article
                  key={item.id}
                  initial={reduceMotion ? undefined : { opacity: 0, y: 18, rotate: index % 2 === 0 ? -3 : 3 }}
                  animate={{ opacity: 1, y: 0, rotate: index % 2 === 0 ? -2 : 2 }}
                  whileHover={reduceMotion ? undefined : { y: -5, rotate: 0 }}
                  className="party-card relative p-5"
                  style={{ backgroundColor: index % 3 === 0 ? "#fff" : index % 3 === 1 ? "#fff0d8" : "#f7eaff" }}
                >
                  <span className="absolute right-4 top-3 text-xl" aria-hidden="true">
                    {index % 3 === 0 ? "♥" : index % 3 === 1 ? "✳" : "✦"}
                  </span>
                  <p className="whitespace-pre-wrap break-words pr-5 leading-7">{item.message}</p>
                  <p className="mt-5 border-t border-dashed border-[#2b1720]/25 pt-3 text-sm font-black">
                    — {item.guest_name}
                  </p>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      {manageToken && (
        <section className="mx-auto mt-12 max-w-5xl rounded-[28px] border-2 border-[#2b1720] bg-[#d9c5ff] p-6 sm:p-8">
          <span className="party-sticker bg-white">Organizer only</span>
          <h2 className="party-display mt-5 text-4xl">THE BACKSTAGE.</h2>
          <p className="mt-3 leading-7">Your people sent these wishes. Give the good ones a spot on the wall.</p>

          {moderationError && <p role="alert" className="mt-4 rounded-xl bg-white p-3 text-sm font-bold">{moderationError}</p>}

          {pending.length === 0 ? (
            <p className="mt-5 rounded-2xl border-2 border-dashed border-[#2b1720]/40 p-5 font-bold">
              No wishes waiting for approval. You're all caught up!
            </p>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {pending.map((item) => (
                <article key={item.id} className="rounded-2xl border-2 border-[#2b1720] bg-white p-5">
                  <p className="whitespace-pre-wrap break-words leading-7">{item.message}</p>
                  <p className="mt-3 text-sm font-black">— {item.guest_name}</p>
                  <div className="mt-5 flex gap-3">
                    <button
                      type="button"
                      onClick={() => moderate(item.id, "approve")}
                      disabled={moderatingId === item.id}
                      className="rounded-full border-2 border-[#2b1720] bg-[#bce9d4] px-4 py-2 text-sm font-black disabled:opacity-50"
                    >
                      Approve ✓
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm("Permanently delete this wish?")) {
                          void moderate(item.id, "delete");
                        }
                      }}
                      disabled={moderatingId === item.id}
                      className="rounded-full border-2 border-[#2b1720] bg-[#ffe0e2] px-4 py-2 text-sm font-black disabled:opacity-50"
                    >
                      Delete ×
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      <footer className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-2 py-10 text-sm font-bold text-[#795e62]">
        <Link href="/" className="party-display text-xl text-[#2b1720]">partybox!</Link>
        <p>Made with a ridiculous amount of love ♥</p>
        <button type="button" onClick={copyLink} className="underline underline-offset-4">
          {copied ? "Copied!" : "Share this little world ↗"}
        </button>
      </footer>
    </main>
  );
}

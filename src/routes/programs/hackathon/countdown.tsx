import { createFileRoute, useHydrated, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { z } from "zod";
import { Button } from "#/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { TextScramble } from "#/components/ui/motion-primitives/text-scramble";
import { useIsReducedMotion } from "#/hooks/browser.ts";
import { events } from "#/lib/meta/events";
import { cn } from "#/lib/utils";
import { noindex } from "#/lib/seo";

const THEMES = ["hg", "spooky"] as const;
type Theme = (typeof THEMES)[number];

// /programs/hackathon/countdown?to=2026-10-31T23:59&title=Hacking%20ends&theme=spooky
// `to` is anything Date understands (ISO, datetime-local) or a ms timestamp (see `vpr date`).
// without `to` it counts down to the hackathon's next milestone; ?setup=true opens the editor
export const Route = createFileRoute("/programs/hackathon/countdown")({
  validateSearch: z.object({
    to: z.optional(z.union([z.number(), z.string()])),
    title: z.optional(z.string()),
    theme: z.optional(z.enum(THEMES)),
    setup: z.optional(z.boolean()),
  }),
  staticData: { title: "Countdown", header: { hidden: true } },
  head: () => ({ meta: noindex() }),
  component: RouteComponent,
});

// the hero's bgtexture01.svg, recolored per theme
const texture = (fill: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 4 4"><path fill="${fill}" d="M1 3h1v1H1V3zm2-2h1v1H3V1z"/></svg>`,
  )}")`;

const THEME_VARS: Record<Theme, CSSProperties> = {
  hg: {
    "--cd-bg": "var(--hg-black)",
    "--cd-accent": "var(--hg-green)",
    "--cd-accent-light": "var(--primary-light)",
    "--cd-texture": texture("oklch(28.595% 0.07057 153.711)"),
  } as CSSProperties,
  spooky: {
    "--cd-bg": "oklch(0.15 0.03 300)",
    "--cd-accent": "oklch(0.6 0.19 45)",
    "--cd-accent-light": "oklch(0.76 0.18 60)",
    "--cd-texture": texture("oklch(0.24 0.06 300)"),
  } as CSSProperties,
};

const STRIPES: CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(135deg, var(--cd-accent) 0px, var(--cd-accent) 10px, rgba(255,255,255,0.12) 10px, rgba(255,255,255,0.12) 20px)",
};

const FINAL_SECONDS = 10;

function parseTarget(to: string | number | undefined): Date | null {
  if (to === undefined || to === "") return null;
  const date = new Date(typeof to === "string" && /^\d+$/.test(to) ? Number(to) : to);
  return Number.isNaN(date.getTime()) ? null : date;
}

// the next thing worth counting down to: doors open, then hacking ends
function hackathonMilestone(): { target: Date; title: string } | null {
  const { name, date } = events.hackathon;
  if (!date) return null;
  if (date.start.getTime() > Date.now()) return { target: date.start, title: `${name} begins` };
  if (date.end) return { target: date.end, title: "Hacking ends" };
  return null;
}

function RouteComponent() {
  const { to, title, theme = "hg", setup } = Route.useSearch();
  const hydrated = useHydrated();

  // the fallback depends on the viewer's clock, so it waits for the client
  const milestone = useMemo(
    () => (hydrated && to === undefined ? hackathonMilestone() : null),
    [hydrated, to],
  );
  const target = useMemo(() => parseTarget(to), [to]) ?? milestone?.target ?? null;

  return (
    <div
      style={THEME_VARS[theme]}
      className="relative min-h-dvh overflow-hidden bg-(--cd-bg) bg-(image:--cd-texture) text-white"
    >
      {theme === "spooky" && <Fog />}
      {!hydrated ? null : target && !setup ? (
        <Countdown
          key={target.getTime()}
          target={target}
          title={title ?? milestone?.title}
          theme={theme}
        />
      ) : (
        <Setup theme={theme} title={title} />
      )}
    </div>
  );
}

/* ---------------------------------- setup --------------------------------- */

function toLocalInput(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function Setup({ theme, title: initialTitle }: { theme: Theme; title?: string }) {
  const navigate = useNavigate({ from: Route.fullPath });
  const [when, setWhen] = useState(() => toLocalInput(new Date(Date.now() + 60 * 60_000)));
  const [title, setTitle] = useState(initialTitle ?? "");

  const go = (to: string | number) =>
    navigate({ search: { to, title: title || undefined, theme, setup: undefined } });

  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
      <form
        className="w-full max-w-md flex flex-col gap-5 bg-black/40 border-2 border-(--cd-accent) p-6 backdrop-blur-sm"
        onSubmit={(e) => {
          e.preventDefault();
          void go(when);
        }}
      >
        <h1 className="font-mono text-2xl">
          <span className="text-(--cd-accent-light)">countdown</span>.config
        </h1>
        <Field>
          <FieldLabel htmlFor="cd-when">Count down to</FieldLabel>
          <Input
            id="cd-when"
            type="datetime-local"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="cd-title">Title</FieldLabel>
          <Input
            id="cd-title"
            placeholder="Hacking ends"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <FieldDescription>Shown above the timer and at the finale.</FieldDescription>
        </Field>
        <div className="flex gap-2">
          {THEMES.map((t) => (
            <Button
              key={t}
              type="button"
              variant={t === theme ? "default" : "outline"}
              onClick={() => void navigate({ search: (prev) => ({ ...prev, theme: t }) })}
            >
              {t === "hg" ? "HackGwinnett" : "Spooky 🎃"}
            </Button>
          ))}
        </div>
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="ghost" onClick={() => void go(Date.now() + 13_000)}>
            Preview ending
          </Button>
          <Button type="submit" className="text-white" style={STRIPES}>
            Start
          </Button>
        </div>
      </form>
    </div>
  );
}

/* -------------------------------- countdown ------------------------------- */

function useNow(enabled: boolean) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!enabled) return;
    const interval = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(interval);
  }, [enabled]);

  return now;
}

function Countdown({ target, title, theme }: { target: Date; title?: string; theme: Theme }) {
  const [ended, setEnded] = useState(false);
  const now = useNow(!ended);

  const remaining = Math.max(0, target.getTime() - now);
  const totalSeconds = Math.ceil(remaining / 1000);

  useEffect(() => {
    if (remaining === 0) setEnded(true);
  }, [remaining]);

  if (ended) {
    return theme === "spooky" ? <SpookyFinale title={title} /> : <HgFinale title={title} />;
  }

  const final = totalSeconds <= FINAL_SECONDS;

  return (
    <div className="relative min-h-dvh flex flex-col items-center justify-center gap-8 px-6 animate-in fade-in slide-in-from-bottom-5 animation-duration-800">
      {final && <FinalPulse key={totalSeconds} theme={theme} />}

      <p className="font-mono text-lg sm:text-2xl md:text-3xl text-white/80 text-center select-none">
        {theme === "spooky" ? (
          <span className="animate-[flicker_4s_infinite]">{title ?? "Something wicked"}</span>
        ) : (
          <TextScramble>{title ?? "Counting down"}</TextScramble>
        )}
      </p>

      {final ? (
        <FinalNumber value={totalSeconds} theme={theme} />
      ) : (
        <Clock totalSeconds={totalSeconds} />
      )}

      <p className="font-mono text-sm text-white/50 text-center">
        {target.toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}
      </p>
    </div>
  );
}

function Clock({ totalSeconds }: { totalSeconds: number }) {
  const units = [
    { label: "days", value: Math.floor(totalSeconds / 86_400) },
    { label: "hours", value: Math.floor(totalSeconds / 3600) % 24 },
    { label: "minutes", value: Math.floor(totalSeconds / 60) % 60 },
    { label: "seconds", value: totalSeconds % 60 },
  ].filter((unit, i) => i > 0 || unit.value > 0);

  return (
    <div className="flex flex-wrap justify-center gap-3 sm:gap-5">
      {units.map((unit) => (
        <div key={unit.label} className="flex flex-col items-center gap-2">
          <div
            className="flex font-mono text-5xl sm:text-7xl md:text-8xl lg:text-9xl tabular-nums px-3 sm:px-5 py-2 border-3 border-(--cd-accent-light)/60 shadow-[0_0_40px_-10px_var(--cd-accent)]"
            style={STRIPES}
          >
            {String(unit.value)
              .padStart(2, "0")
              .split("")
              .map((digit, i, all) => (
                <Digit key={all.length - i} digit={digit} />
              ))}
          </div>
          <span className="font-mono text-xs sm:text-sm uppercase tracking-[0.3em] text-white/60">
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function Digit({ digit }: { digit: string }) {
  return (
    <span className="relative inline-block overflow-hidden w-[1ch]">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={digit}
          className="inline-block"
          initial={{ y: "-100%", opacity: 0, filter: "blur(4px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "100%", opacity: 0, filter: "blur(4px)" }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function FinalNumber({ value, theme }: { value: number; theme: Theme }) {
  return (
    <div className="relative h-[40vh] flex items-center justify-center">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          className={cn(
            "font-mono font-bold tabular-nums text-[38vh] leading-none text-(--cd-accent-light)",
            theme === "spooky"
              ? "drop-shadow-[0_0_30px_var(--cd-accent)]"
              : "drop-shadow-[0_0_20px_var(--cd-accent)]",
          )}
          initial={{ scale: 2.2, opacity: 0, filter: "blur(12px)" }}
          animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
          exit={{ scale: 0.4, opacity: 0, filter: "blur(8px)" }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

// one thump per second over the last ten
function FinalPulse({ theme }: { theme: Theme }) {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          theme === "spooky"
            ? "radial-gradient(circle, transparent 30%, oklch(0.45 0.2 30 / 0.55) 100%)"
            : "radial-gradient(circle, transparent 35%, color-mix(in oklch, var(--cd-accent) 45%, transparent) 100%)",
      }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.9, ease: "easeOut" }}
    />
  );
}

/* --------------------------------- finales -------------------------------- */

const rand = (min: number, max: number) => min + Math.random() * (max - min);

function HgFinale({ title }: { title?: string }) {
  const reducedMotion = useIsReducedMotion();
  const pixels = useMemo(
    () =>
      Array.from({ length: 90 }, (_, i) => {
        const angle = rand(0, Math.PI * 2);
        const distance = rand(30, 75);
        return {
          id: i,
          x: `${Math.cos(angle) * distance}vmax`,
          y: `${Math.sin(angle) * distance}vmax`,
          size: rand(8, 28),
          rotate: rand(-360, 360),
          delay: rand(0, 0.25),
          color: ["var(--hg-green)", "var(--primary-light)", "white"][i % 3],
        };
      }),
    [],
  );

  return (
    <div className="relative min-h-dvh flex items-center justify-center overflow-hidden">
      {/* flash */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-20 bg-(--cd-accent-light)"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />

      <motion.div
        className="absolute inset-0 bg-[url('/assets/images/hero/hexagons.svg')]"
        initial={{ opacity: 0, scale: 1.3 }}
        animate={{ opacity: 0.25, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      />

      {!reducedMotion && (
        <>
          {[0, 0.2, 0.4].map((delay) => (
            <motion.div
              key={delay}
              className="pointer-events-none absolute size-24 border-4 border-(--cd-accent-light)"
              initial={{ scale: 0, opacity: 1, rotate: 0 }}
              animate={{ scale: 30, opacity: 0, rotate: 45 }}
              transition={{ duration: 1.6, delay, ease: "easeOut" }}
            />
          ))}
          {pixels.map((p) => (
            <motion.span
              key={p.id}
              className="pointer-events-none absolute"
              style={{ width: p.size, height: p.size, background: p.color }}
              initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
              animate={{ x: p.x, y: p.y, opacity: 0, rotate: p.rotate }}
              transition={{ duration: rand(1.4, 2.4), delay: p.delay, ease: [0.1, 0.8, 0.3, 1] }}
            />
          ))}
        </>
      )}

      <motion.div
        className="relative z-10 flex flex-col items-center gap-6 px-6 text-center"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.3 }}
      >
        <img
          src={"/assets/images/brand/hgtransparent.svg".toAsset()}
          alt=""
          className="size-24 sm:size-32 drop-shadow-[0_0_30px_var(--cd-accent)]"
        />
        <h1 className="font-mono text-5xl sm:text-7xl md:text-8xl text-(--cd-accent-light) select-none">
          <TextScramble duration={1.2} trigger={!reducedMotion}>
            {"IT'S TIME"}
          </TextScramble>
        </h1>
        {title && (
          <motion.p
            className="font-mono text-xl sm:text-3xl text-white/80"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
          >
            {title}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}

function SpookyFinale({ title }: { title?: string }) {
  const reducedMotion = useIsReducedMotion();
  const bats = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => {
        const angle = rand(0, Math.PI * 2);
        return {
          id: i,
          x: `${Math.cos(angle) * rand(55, 80)}vmax`,
          y: `${Math.sin(angle) * rand(55, 80) - 10}vmax`,
          size: rand(28, 90),
          delay: rand(0.3, 1.1),
          duration: rand(1.8, 3.2),
          flap: rand(0.12, 0.2),
        };
      }),
    [],
  );

  return (
    <div
      className={cn(
        "relative min-h-dvh flex items-center justify-center overflow-hidden",
        !reducedMotion && "animate-shake-lg-once",
      )}
    >
      {/* lightning: a couple of uneven strikes, then darkness */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-30 bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.1, 0.9, 0, 0.6, 0] }}
        transition={{ duration: 1.1, times: [0, 0.05, 0.15, 0.22, 0.4, 0.5, 1] }}
      />

      {/* pumpkin glow rising from below */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3"
        style={{
          background:
            "radial-gradient(ellipse at bottom, color-mix(in oklch, var(--cd-accent) 50%, transparent), transparent 70%)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.7, 1] }}
        transition={{ duration: 3, delay: 0.8, repeat: Infinity, repeatType: "mirror" }}
      />

      {!reducedMotion &&
        bats.map((bat) => (
          <motion.div
            key={bat.id}
            className="pointer-events-none absolute z-20 text-black"
            initial={{ x: 0, y: 0, scale: 0.1, opacity: 0 }}
            animate={{ x: bat.x, y: bat.y, scale: 1, opacity: [0, 1, 1, 0] }}
            transition={{ duration: bat.duration, delay: bat.delay, ease: "easeIn" }}
          >
            <Bat size={bat.size} flap={bat.flap} />
          </motion.div>
        ))}

      <div className="relative z-10 flex flex-col items-center gap-4 px-6 text-center">
        <motion.span
          className="text-8xl sm:text-9xl"
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: [0, 1.4, 1], rotate: [-30, 10, 0] }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          🎃
        </motion.span>
        <motion.h1
          className="font-mono font-bold text-6xl sm:text-8xl md:text-9xl text-(--cd-accent-light) select-none animate-[flicker_3s_infinite_2s]"
          style={{
            textShadow:
              "0 0 20px var(--cd-accent), 0 6px 0 oklch(0.4 0.15 40), 0 14px 18px oklch(0 0 0 / 0.6)",
          }}
          initial={{ opacity: 0, y: -40, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 1.3, duration: 0.6 }}
        >
          BOO!
        </motion.h1>
        <motion.p
          className="font-mono text-xl sm:text-3xl text-white/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 1.2 }}
        >
          {title ?? "The witching hour is here."}
        </motion.p>
      </div>
    </div>
  );
}

function Bat({ size, flap }: { size: number; flap: number }) {
  return (
    <motion.svg
      viewBox="0 0 64 32"
      width={size}
      height={size / 2}
      fill="currentColor"
      className="drop-shadow-[0_0_6px_var(--cd-accent)]"
      animate={{ scaleY: [1, 0.35, 1] }}
      transition={{ duration: flap * 2, repeat: Infinity }}
    >
      <path d="M32 10c-1.5-3-3-4-3-4l-1 4c-6-1-10-6-14-9 1 4 0 7-3 8C8 7 4 7 0 9c5 2 8 6 9 11 3-3 7-3 10-1 2-3 7-3 9 1 1 2 2 3 4 5 2-2 3-3 4-5 2-4 7-4 9-1 3-2 7-2 10 1 1-5 4-9 9-11-4-2-8-2-11 0-3-1-4-4-3-8-4 3-8 8-14 9l-1-4s-1.5 1-3 4z" />
    </motion.svg>
  );
}

function Fog() {
  return (
    <>
      <style>{`
        @keyframes flicker {
          0%, 19%, 21%, 23%, 54%, 56%, 100% { opacity: 1; }
          20%, 22%, 55% { opacity: 0.35; }
        }
      `}</style>
      {[0, 1].map((i) => (
        <motion.div
          key={i}
          className="pointer-events-none absolute -inset-x-1/2 bottom-0 h-1/2"
          style={{
            background:
              "radial-gradient(ellipse at center, oklch(0.6 0.03 300 / 0.12), transparent 60%)",
          }}
          animate={{ x: i ? ["10%", "-10%"] : ["-10%", "10%"] }}
          transition={{
            duration: 18 + i * 6,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  );
}

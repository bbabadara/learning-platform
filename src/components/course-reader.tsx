"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Volume2,
  X,
  Play,
  Pause,
  Square,
  Gauge as GaugeIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toSegments } from "@/lib/textify";

const SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2];

export default function CourseReader({ content }: { content: string }) {
  const segments = useMemo(() => toSegments(content), [content]);

  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [current, setCurrent] = useState(0);
  const [rate, setRate] = useState(1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState<string>("");

  const currentIndexRef = useRef(0);
  const sessionRef = useRef(0);
  const currentSentenceRef = useRef<HTMLParagraphElement | null>(null);

  const supported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    if (!supported) return;
    const load = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
      if (v.length) {
        setVoiceURI((uri) => {
          if (uri && v.some((x) => x.voiceURI === uri)) return uri;
          const fr = v.find((x) => x.lang.toLowerCase().startsWith("fr"));
          return (fr ?? v[0]).voiceURI;
        });
      }
    };
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", load);
      window.speechSynthesis.cancel();
    };
  }, [supported]);

  useEffect(() => {
    if (open && currentSentenceRef.current) {
      currentSentenceRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [current, open]);

  function findVoice(uri: string) {
    return voices.find((v) => v.voiceURI === uri);
  }

  function speakFrom(index: number) {
    if (!supported || !segments.length) return;
    const session = ++sessionRef.current;
    window.speechSynthesis.cancel();

    const speak = () => {
      if (sessionRef.current !== session) return;
      const text = segments[index]?.text;
      if (!text) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "fr-FR";
      utterance.rate = rate;
      const voice = findVoice(voiceURI);
      if (voice) utterance.voice = voice;
      utterance.onend = () => {
        if (sessionRef.current !== session) return;
        const next = index + 1;
        if (next < segments.length) {
          currentIndexRef.current = next;
          setCurrent(next);
          speakFrom(next);
        } else {
          setPlaying(false);
          setPaused(false);
          setCurrent(0);
          currentIndexRef.current = 0;
        }
      };
      utterance.onerror = () => {
        if (sessionRef.current === session) {
          setPlaying(false);
          setPaused(false);
        }
      };
      window.speechSynthesis.speak(utterance);
    };

    currentIndexRef.current = index;
    setCurrent(index);
    setPlaying(true);
    setPaused(false);
    window.setTimeout(speak, 60);
  }

  function togglePlay() {
    if (!supported) return;
    if (playing && !paused) {
      window.speechSynthesis.pause();
      setPaused(true);
      return;
    }
    if (playing && paused) {
      window.speechSynthesis.resume();
      setPaused(false);
      return;
    }
    speakFrom(currentIndexRef.current);
  }

  function stop() {
    if (!supported) return;
    sessionRef.current++;
    window.speechSynthesis.cancel();
    setPlaying(false);
    setPaused(false);
  }

  function changeRate(nextRate: number) {
    setRate(nextRate);
    if (playing) speakFrom(currentIndexRef.current);
  }

  function changeVoice(nextURI: string) {
    setVoiceURI(nextURI);
    if (playing) speakFrom(currentIndexRef.current);
  }

  function jumpTo(index: number) {
    if (playing || paused) {
      sessionRef.current++;
      window.speechSynthesis.cancel();
    }
    speakFrom(index);
  }

  if (!segments.length || !supported) return null;

  return (
    <div>
      <div className="mb-4 flex items-center justify-end">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <Volume2 className="h-4 w-4 text-indigo-500" />
          {open ? "Fermer l'écoute" : "Écouter le cours"}
        </button>
      </div>

      {open && (
        <div className="mb-6 overflow-hidden rounded-2xl border border-indigo-200 bg-indigo-50/60 dark:border-indigo-500/30 dark:bg-indigo-950/30">
          <div className="flex flex-wrap items-center gap-2 border-b border-indigo-100 px-4 py-3 dark:border-indigo-500/20">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={paused ? "Reprendre" : playing ? "Pause" : "Lire"}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-sm transition-transform hover:scale-105"
            >
              {playing && !paused ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 translate-x-px" />
              )}
            </button>
            <button
              type="button"
              onClick={stop}
              aria-label="Arrêter"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-indigo-200 bg-white text-zinc-600 transition-colors hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <Square className="h-3.5 w-3.5" />
            </button>

            <span className="px-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              {playing || paused ? current + 1 : 1} / {segments.length}
            </span>

            <label className="inline-flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300">
              <GaugeIcon className="h-3.5 w-3.5 text-indigo-500" />
              <select
                value={rate}
                onChange={(e) => changeRate(Number(e.target.value))}
                className="rounded-lg border border-indigo-200 bg-white px-2 py-1 text-xs font-medium text-zinc-700 dark:border-indigo-500/30 dark:bg-zinc-900 dark:text-zinc-200"
              >
                {SPEEDS.map((s) => (
                  <option key={s} value={s}>
                    {s.toLocaleString("fr-FR")}×
                  </option>
                ))}
              </select>
            </label>

            {voices.length > 1 && (
              <label className="inline-flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                <Volume2 className="h-3.5 w-3.5 text-indigo-500" />
                <select
                  value={voiceURI}
                  onChange={(e) => changeVoice(e.target.value)}
                  className="max-w-[10rem] truncate rounded-lg border border-indigo-200 bg-white px-2 py-1 text-xs font-medium text-zinc-700 dark:border-indigo-500/30 dark:bg-zinc-900 dark:text-zinc-200"
                >
                  {voices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer"
              className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-indigo-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto px-4 py-3 sm:px-6">
            {segments.map((seg) => {
              const active = seg.id === current;
              return (
                <p
                  key={seg.id}
                  ref={active ? currentSentenceRef : undefined}
                  onClick={() => jumpTo(seg.id)}
                  className={cn(
                    "cursor-pointer rounded-lg px-2 py-1.5 text-[0.95rem] leading-7 transition-colors",
                    active
                      ? "bg-white text-zinc-900 shadow-sm ring-1 ring-indigo-300 dark:bg-zinc-800 dark:text-zinc-50 dark:ring-indigo-500/60"
                      : "text-zinc-600 hover:bg-white/60 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-50",
                  )}
                >
                  {seg.text}
                </p>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
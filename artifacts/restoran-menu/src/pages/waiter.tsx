import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, CheckCircle, ChefHat, LogOut,
  AlertCircle, Wifi, RefreshCw, Volume2, VolumeX, Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useInterval } from "@/hooks/use-interval";
import { useLocation } from "wouter";

type WLang = "en" | "am";

const W: Record<string, Record<WLang, string>> = {
  title:          { en: "Waiter Panel",             am: "አስተናጋጅ ፓነል"              },
  pinLabel:       { en: "Enter your PIN",            am: "PIN ያስገቡ"                },
  loginBtn:       { en: "Login →",                  am: "ግባ →"                    },
  wrongPin:       { en: "Wrong PIN. Try again.",     am: "ስህተት PIN። እንደገና ሞክሩ።"  },
  back:           { en: "← Back",                   am: "← ተመለስ"                 },
  calls:          { en: "Waiter Calls",              am: "አስተናጋጅ ጥሪዎች"            },
  active:         { en: "active",                    am: "ንቁ"                      },
  noCalls:        { en: "No pending calls",          am: "ምንም ጥሪ የለም"              },
  noCallsSub:     { en: "Table calls will appear here", am: "የጠረጴዛ ጥሪዎች እዚህ ይታያሉ" },
  table:          { en: "Table",                     am: "ጠረጴዛ"                    },
  calling:        { en: "Calling",                   am: "እየጠሩ"                    },
  calledTimes:    { en: "times",                     am: "ጊዜ ጠሩ"                  },
  arrived:        { en: "Arrived",                   am: "ደረስኩ"                   },
  logout:         { en: "Logout",                    am: "ውጣ"                      },
  mute:           { en: "Mute",                      am: "ድምጽ ዝጋ"                 },
  unmute:         { en: "Unmute",                    am: "ድምጽ ክፈት"               },
};

/* ─── SOUND ENGINE ───────────────────────────────────────────── */
function useNotificationSound() {
  const ctx = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!ctx.current || ctx.current.state === "closed") {
      ctx.current = new AudioContext();
    }
    if (ctx.current.state === "suspended") ctx.current.resume();
    return ctx.current;
  }, []);

  const vibrate = useCallback((pattern: number[]) => {
    try { if ("vibrate" in navigator) navigator.vibrate(pattern); } catch {}
  }, []);

  const playCall = useCallback(() => {
    try {
      const ac = getCtx();
      const playTone = (freq: number, startTime: number, dur: number) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.connect(gain); gain.connect(ac.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.4, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);
        osc.start(startTime);
        osc.stop(startTime + dur);
      };
      const t = ac.currentTime;
      playTone(880, t, 0.25);
      playTone(1100, t + 0.28, 0.25);
      playTone(880, t + 0.56, 0.35);
    } catch {}
    vibrate([300, 100, 300, 100, 500]);
  }, [getCtx, vibrate]);

  return { playCall };
}

const API_BASE = "/api";

/* ─── LOGIN ──────────────────────────────────────────────────── */
export default function WaiterPage() {
  const [pin, setPin]           = useState("");
  const [isLogged, setIsLogged] = useState(false);
  const [error, setError]       = useState("");
  const [shake, setShake]       = useState(false);
  const [loading, setLoading]   = useState(false);
  const [, navigate]            = useLocation();
  const [lang, setLang]         = useState<WLang>(() => {
    try { const s = localStorage.getItem("staff_lang") as WLang; return (s === "en" || s === "am") ? s : "en"; } catch { return "en"; }
  });

  const toggleLang = () => {
    const next: WLang = lang === "en" ? "am" : "en";
    setLang(next);
    try { localStorage.setItem("staff_lang", next); } catch {}
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "waiter", pin }),
      });
      if (res.ok) {
        setIsLogged(true);
      } else {
        setError(W.wrongPin[lang]);
        setPin(""); setShake(true); setTimeout(() => setShake(false), 500);
      }
    } catch {
      setError(W.wrongPin[lang]);
      setPin(""); setShake(true); setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  if (!isLogged) {
    return (
      <div
        className="min-h-[100dvh] bg-gradient-to-br from-[#F8F5F0] to-[#EDE8E2] flex items-center justify-center p-4"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full bg-[#C1440E]/6" />
          <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-[#1B2A4A]/5" />
        </div>

        <button
          onClick={toggleLang}
          className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 rounded-full text-xs font-bold text-stone-600 shadow-sm touch-manipulation"
        >
          <Globe className="w-3.5 h-3.5" />
          {lang === "en" ? "🇬🇧 EN" : "🇪🇹 AM"}
        </button>

        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-sm"
        >
          <div className="bg-white rounded-3xl shadow-2xl shadow-stone-200/80 overflow-hidden">
            <div className="bg-[#1B2A4A] px-8 py-8 text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ChefHat className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-white font-bold text-xl tracking-wide">{W.title[lang]}</h1>
              <p className="text-white/40 text-xs mt-1 tracking-widest">AL-RISALA</p>
            </div>

            <div className="px-8 py-7 space-y-4">
              <p className="text-center text-stone-400 text-sm">{W.pinLabel[lang]}</p>
              <form onSubmit={handleLogin} className="space-y-4">
                <motion.input
                  type="password"
                  inputMode="numeric"
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  placeholder="• • • •"
                  animate={shake ? { x: [-6, 6, -5, 5, -3, 3, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  className="w-full bg-stone-50 border-2 border-stone-200 focus:border-[#1B2A4A] text-center text-4xl tracking-[0.6em] text-[#1B2A4A] rounded-2xl py-5 outline-none transition-colors font-bold placeholder:text-stone-300 placeholder:text-2xl placeholder:tracking-[0.5em]"
                  autoFocus
                />
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
                    </motion.div>
                  )}
                </AnimatePresence>
                <button
                  type="submit"
                  disabled={!pin || loading}
                  className="w-full bg-[#1B2A4A] hover:bg-[#243760] active:bg-[#243760] text-white font-bold py-4 rounded-2xl transition-colors disabled:opacity-30 text-sm touch-manipulation flex items-center justify-center gap-2"
                >
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{lang === "en" ? "Verifying…" : "እያረጋገጡ…"}</>
                    : W.loginBtn[lang]
                  }
                </button>
              </form>
              <button
                onClick={() => navigate("/")}
                className="w-full text-stone-400 hover:text-stone-600 text-sm py-3 transition-colors touch-manipulation"
              >
                {W.back[lang]}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return <WaiterDashboard lang={lang} toggleLang={toggleLang} onLogout={() => { setIsLogged(false); navigate("/"); }} />;
}

/* ─── DASHBOARD ─────────────────────────────────────────────── */
function WaiterDashboard({ lang, toggleLang, onLogout }: { lang: WLang; toggleLang: () => void; onLogout: () => void }) {
  const queryClient = useQueryClient();
  const [muted, setMuted] = useState(false);
  const { playCall } = useNotificationSound();

  const prevTotalCount = useRef<number | null>(null);

  const { data: calls = [], isFetching } = useQuery({
    queryKey: ["waiter-calls"],
    queryFn: async () => { const r = await fetch(`${API_BASE}/waiter-calls`); return r.ok ? r.json() : []; },
    staleTime: 5_000,
    gcTime: 10 * 60_000,
  });

  const { data: tables = [] } = useQuery({
    queryKey: ["waiter-tables"],
    queryFn: async () => { const r = await fetch(`${API_BASE}/tables`); return r.ok ? r.json() : []; },
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  });

  const tableMap = new Map((tables as any[]).map((t: any) => [t.id, t]));

  const callCount = (calls as any[]).length;
  const totalCount = (calls as any[]).reduce((s: number, c: any) => s + (c.count || 1), 0);

  useEffect(() => {
    if (prevTotalCount.current !== null && totalCount > prevTotalCount.current && !muted) {
      playCall();
    }
    prevTotalCount.current = totalCount;
  }, [totalCount, muted, playCall]);

  useInterval(() => {
    queryClient.invalidateQueries({ queryKey: ["waiter-calls"] });
  }, 5000);

  const clearCall = useMutation({
    mutationFn: async (tableId: string) => fetch(`${API_BASE}/waiter-calls/${tableId}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["waiter-calls"] })
  });

  return (
    <div className="h-[100dvh] bg-[#F4F6FA] flex flex-col overflow-hidden">

      <header className="bg-[#1B2A4A] sticky top-0 z-20 flex-shrink-0"
        style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="flex items-stretch px-3 sm:px-5">

          <div className="flex items-center gap-2.5 py-3.5 pr-4 border-r border-white/10 mr-3 flex-shrink-0">
            <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
              <ChefHat className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-white font-bold text-sm leading-none">{lang === "en" ? "Waiter" : "አስተናጋጅ"}</p>
              <p className="text-white/40 text-[10px]">AL-RISALA</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 flex-1">
            <Bell className="w-4 h-4 text-white" />
            <span className="text-white font-semibold text-sm">{W.calls[lang]}</span>
            {callCount > 0 && (
              <span className="bg-[#C1440E] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                {callCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 ml-auto flex-shrink-0 pl-3 border-l border-white/10">
            <div className="hidden sm:flex items-center gap-1.5 text-white/30 text-xs px-2">
              <span className={cn("w-1.5 h-1.5 rounded-full", isFetching ? "bg-amber-400 animate-pulse" : "bg-green-400")} />
              <Wifi className="w-3 h-3" />
            </div>

            <button
              onClick={toggleLang}
              className="text-white/40 hover:text-white transition-colors p-2.5 rounded-xl touch-manipulation text-xs font-bold"
              title="Change language"
            >
              {lang === "en" ? "አማ" : "EN"}
            </button>

            <button
              onClick={() => setMuted(m => !m)}
              className={cn("transition-colors p-2.5 rounded-xl touch-manipulation", muted ? "text-red-400 hover:text-red-300" : "text-white/40 hover:text-white")}
              title={muted ? W.unmute[lang] : W.mute[lang]}
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => { queryClient.invalidateQueries(); }}
              className="text-white/40 hover:text-white transition-colors p-2.5 rounded-xl touch-manipulation"
            >
              <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} />
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm transition-colors py-3.5 px-2.5 touch-manipulation"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">{W.logout[lang]}</span>
            </button>
          </div>
        </div>
      </header>

      <main
        className="flex-1 overflow-y-auto overscroll-contain"
        style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
      >
        <div className="p-3 sm:p-5 max-w-6xl mx-auto space-y-4">
          <div className="flex items-center justify-between pt-1">
            <h2 className="text-[#1B2A4A] font-bold text-base sm:text-lg">{W.calls[lang]}</h2>
            {callCount > 0 && (
              <span className="text-sm text-stone-400">{callCount} {W.active[lang]}</span>
            )}
          </div>

          {callCount === 0 ? (
            <EmptyCard
              icon={<Bell className="w-10 h-10 text-stone-300" />}
              title={W.noCalls[lang]}
              sub={W.noCallsSub[lang]}
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              <AnimatePresence>
                {(calls as any[]).map((call: any) => {
                  const tbl = tableMap.get(call.tableId);
                  const tableNum = tbl ? tbl.number : "—";
                  const tableLoc = tbl?.location || "";
                  return (
                  <motion.div
                    key={call.tableId}
                    layout
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.85, opacity: 0 }}
                    className="bg-white rounded-2xl border-2 border-amber-300 shadow-sm shadow-amber-100/60 p-4 flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-stone-400 text-[9px] font-semibold uppercase tracking-widest">{W.table[lang]}</p>
                        <p className="text-[#1B2A4A] font-black text-4xl leading-none mt-0.5">{tableNum}</p>
                        {tableLoc && <p className="text-stone-400 text-[10px] mt-0.5 leading-none">{tableLoc}</p>}
                      </div>
                      <div className="flex flex-col items-end gap-1 mt-0.5">
                        <span className="flex items-center gap-1 bg-amber-100 text-amber-700 text-[9px] font-bold px-2 py-1 rounded-full border border-amber-200 flex-shrink-0">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                          {W.calling[lang]}
                        </span>
                        {(call.count || 1) > 1 && (
                          <span className="bg-[#C1440E] text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                            {call.count}× {W.calledTimes[lang]}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => clearCall.mutate(call.tableId)}
                      className="w-full flex items-center justify-center gap-2 bg-[#1B2A4A] hover:bg-[#243760] active:bg-[#243760] text-white font-bold py-3 rounded-xl text-sm transition-colors touch-manipulation"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {W.arrived[lang]}
                    </button>
                  </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/* ─── EMPTY CARD ─────────────────────────────────────────────── */
function EmptyCard({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-10 sm:p-16 flex flex-col items-center text-center">
      <div className="mb-4 opacity-50">{icon}</div>
      <p className="text-stone-600 font-semibold text-sm">{title}</p>
      <p className="text-stone-400 text-xs sm:text-sm mt-1">{sub}</p>
    </div>
  );
}

import React, { useState, useRef } from "react";
import { Bell, CheckCircle, X, Search, SlidersHorizontal, ArrowUpDown, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { INITIAL_MENU, INITIAL_CATEGORIES } from "@/lib/initial-data";

const API_BASE = "/api";
const BUNDLE_KEY = "al_bundle_v2";
const BUNDLE_TTL = 60_000;

type Lang = "en" | "am";
interface LangMap { en: string; am: string; }
interface MenuItem { id: string; name: LangMap; description: LangMap; price: number; category: string; image: string; }
interface Category { id: string; name: LangMap; order: number; }
interface Bundle { menu: MenuItem[]; categories: Category[]; settings: { logo: string | null; restaurantName: string }; }

const T = {
  callWaiter:   { en: "Call Waiter",      am: "አስተናጋጅ ይጥሩ"     },
  calling:      { en: "Calling…",        am: "እየጠሩ ነው…"        },
  waiterComing: { en: "Waiter Coming!",  am: "አስተናጋጅ መጣ!"      },
  searchPlaceholder: { en: "Search menu…", am: "ሜኑ ፈልግ…"        },
  noResults:    { en: "No items found",  am: "ምንም ምርት አልተገኘም"  },
  noResultsSub: { en: "Try a different keyword", am: "ሌላ ቃል ይሞክሩ" },
} as const;
const t = (key: keyof typeof T, lang: Lang) => T[key][lang];

function readBundleCache(): Bundle | undefined {
  try {
    const raw = localStorage.getItem(BUNDLE_KEY);
    if (!raw) return undefined;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts < BUNDLE_TTL) return data as Bundle;
  } catch {}
  return undefined;
}
function writeBundleCache(data: Bundle) {
  try { localStorage.setItem(BUNDLE_KEY, JSON.stringify({ data, ts: Date.now() })); } catch {}
}

const INITIAL_BUNDLE: Bundle = {
  menu: INITIAL_MENU as unknown as MenuItem[],
  categories: INITIAL_CATEGORIES as unknown as Category[],
  settings: { logo: null, restaurantName: "AL-RISALA" },
};

function ItemDetailModal({ item, lang, onClose }: { item: MenuItem; lang: Lang; onClose: () => void }) {
  const gl = (map: LangMap | undefined) => map ? (map[lang] || map.en || "") : "";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm sm:max-w-md bg-white rounded-[2rem] overflow-hidden shadow-2xl mx-4"
        onClick={e => e.stopPropagation()}
        style={{ animation: "modalIn 0.18s ease-out" }}
      >
        <div className="relative w-full aspect-[4/3] bg-stone-100 overflow-hidden">
          {item.image ? (
            <img src={item.image} alt={gl(item.name)}
              className="w-full h-full object-cover"
              style={{ filter: "brightness(1.06) saturate(1.1)" }}
              loading="eager" decoding="async" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-stone-100">
              <span className="text-stone-300 text-6xl">🍽</span>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
          <button onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 pt-5 pb-8">
          <h2 className="font-serif font-bold text-[#1B2A4A] text-xl leading-snug mb-2">{gl(item.name)}</h2>
          {gl(item.description) && (
            <p className="text-stone-500 text-sm leading-relaxed mb-4">{gl(item.description)}</p>
          )}
          <span className="text-[#C1440E] font-bold text-2xl">{item.price} ETB</span>
        </div>
      </div>
    </div>
  );
}

export default function MenuPage() {
  const params = useParams();
  const tableId = params.tableId || "1";
  return <MenuContent tableId={tableId} />;
}

function MenuContent({ tableId }: { tableId: string }) {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      const s = localStorage.getItem("menu_lang") as Lang;
      return (s === "en" || s === "am") ? s : "am";
    } catch { return "am"; }
  });
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedItem, setSelectedItem]     = useState<MenuItem | null>(null);
  const [langMenuOpen, setLangMenuOpen]     = useState(false);
  const [waiterCalled, setWaiterCalled]     = useState(false);
  const [searchQuery, setSearchQuery]       = useState("");
  const [sortOrder, setSortOrder]           = useState<"default" | "asc" | "desc">("default");
  const [filterOpen, setFilterOpen]         = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const cachedBundle = readBundleCache();

  const { data: bundle = INITIAL_BUNDLE } = useQuery<Bundle>({
    queryKey: ["bundle"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/bundle`);
      if (!res.ok) return cachedBundle ?? INITIAL_BUNDLE;
      const data = await res.json() as Bundle;
      writeBundleCache(data);
      return data;
    },
    initialData: cachedBundle ?? INITIAL_BUNDLE,
    initialDataUpdatedAt: cachedBundle ? Date.now() - 5_000 : 0,
    staleTime: 0,
    gcTime: 10 * 60_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const { menu: menuData = INITIAL_BUNDLE.menu, categories = INITIAL_BUNDLE.categories, settings } = bundle;
  const restaurantLogo = settings?.logo ?? null;

  const callWaiter = useMutation({
    mutationFn: async () => {
      await fetch(`${API_BASE}/waiter-call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableId }),
      });
    },
    onSuccess: () => { setWaiterCalled(true); setTimeout(() => setWaiterCalled(false), 4000); },
  });

  const allCategory: Category = { id: "all", name: { en: "All", am: "ሁሉም" }, order: 0 };
  const allTabs = [allCategory, ...categories];
  const gl = (map: LangMap | undefined) => map ? (map[lang] || map.en || "") : "";

  const query = searchQuery.trim().toLowerCase();
  const filteredItems = menuData
    .filter(item => {
      const inCategory = activeCategory === "all" || item.category === activeCategory;
      if (!inCategory) return false;
      if (!query) return true;
      return (
        gl(item.name).toLowerCase().includes(query) ||
        gl(item.description).toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      if (sortOrder === "asc") return a.price - b.price;
      if (sortOrder === "desc") return b.price - a.price;
      return 0;
    });

  const isFiltered = sortOrder !== "default";

  const SORT_OPTIONS: { key: "default" | "asc" | "desc"; labelEn: string; labelAm: string; icon: React.ReactNode }[] = [
    { key: "default",  labelEn: "Default order",      labelAm: "ነባሪ ቅደም ተከተል", icon: <ArrowUpDown  className="w-4 h-4" /> },
    { key: "asc",      labelEn: "Price: Low → High",  labelAm: "ዋጋ: ዝቅ → ከፍ",  icon: <TrendingUp   className="w-4 h-4" /> },
    { key: "desc",     labelEn: "Price: High → Low",  labelAm: "ዋጋ: ከፍ → ዝቅ",  icon: <TrendingDown className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-[100dvh] bg-background w-full flex flex-col relative overflow-hidden sm:max-w-2xl sm:mx-auto sm:my-4 sm:rounded-[2rem] sm:shadow-2xl sm:shadow-foreground/5 sm:border sm:border-border/50">
      <style>{`
        @keyframes modalIn { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes cardFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .menu-card { animation: cardFadeIn 0.22s ease-out both; }
        @supports (-webkit-touch-callout: none) {
          .menu-card-img { height: 160px !important; }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {selectedItem && (
        <ItemDetailModal item={selectedItem} lang={lang} onClose={() => setSelectedItem(null)} />
      )}

      <header className="sticky top-0 z-20 border-b border-border/40 backdrop-blur-xl bg-background/95">
        <div className="relative w-full overflow-hidden" style={{ minHeight: restaurantLogo ? "auto" : "160px" }}>
          {!restaurantLogo && (
            <>
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=65&fit=crop&auto=format')" }} />
              <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, rgba(10,20,45,0.85) 0%, rgba(42,16,4,0.83) 55%, rgba(10,5,2,0.90) 100%)" }} />
            </>
          )}
          {restaurantLogo && (
            <div className="absolute inset-0 bg-[#0f172a]" />
          )}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/70 to-transparent" style={{ zIndex: 10 }} />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/70 to-transparent" style={{ zIndex: 10 }} />

          <div className="absolute top-4 right-4 z-50">
            <button
              onClick={() => setLangMenuOpen(o => !o)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-xs font-bold text-white transition-colors backdrop-blur-sm"
            >
              <span>{lang === "en" ? "🇬🇧" : "🇪🇹"}</span>
              <span>{lang === "en" ? "EN" : "አማ"}</span>
              <span className="text-white/60 text-[10px]">▾</span>
            </button>
            {langMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setLangMenuOpen(false)} />
                <div className="absolute top-10 right-0 z-50 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden w-36 py-1">
                  {([
                    { code: "en", flag: "🇬🇧", label: "English" },
                    { code: "am", flag: "🇪🇹", label: "አማርኛ" },
                  ] as { code: Lang; flag: string; label: string }[]).map(({ code, flag, label }) => (
                    <button key={code}
                      onClick={() => { setLang(code); setLangMenuOpen(false); try { localStorage.setItem("menu_lang", code); } catch {} }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors",
                        lang === code ? "bg-primary/10 text-primary font-semibold" : "text-slate-700 hover:bg-slate-50"
                      )}>
                      <span className="text-base">{flag}</span>
                      <span className="flex-1 text-left">{label}</span>
                      {lang === code && <span className="text-primary text-xs font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {restaurantLogo ? (
            <div className="relative w-full overflow-hidden" style={{ aspectRatio: "2.55 / 1", maxHeight: "265px" }}>
              <img
                key={restaurantLogo}
                src={restaurantLogo}
                alt="AL-RISALA"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
              />
            </div>
          ) : (
            <>
              <p className="relative text-[#D4AF37]/70 text-[10px] tracking-[0.35em] font-bold mb-2">مطعم</p>
              <h1 className="relative font-serif text-3xl font-bold text-white tracking-[0.15em] uppercase drop-shadow-lg">AL-RISALA</h1>
              <p className="relative text-[#D4AF37]/90 text-sm font-bold tracking-[0.3em] mt-1">الرسالة</p>
              <div className="relative flex items-center gap-3 mt-3 w-48">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#D4AF37]/60" />
                <span className="text-[#D4AF37]/80 text-[9px] tracking-[0.2em] font-semibold">✦</span>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#D4AF37]/60" />
              </div>
            </>
          )}
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto py-2 px-3 sm:px-5 no-scrollbar snap-x bg-background">
          {allTabs.map((category) => {
            const isActive = activeCategory === category.id;
            return (
              <button key={category.id} onClick={() => { setActiveCategory(category.id); setSearchQuery(""); }}
                className={cn(
                  "snap-start px-4 py-1.5 rounded-full text-sm sm:text-base font-semibold transition-colors duration-150 flex-shrink-0",
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}>
                {gl(category.name)}
              </button>
            );
          })}
        </div>

        {/* Search bar + Filter button */}
        <div className="px-3 min-[400px]:px-4 sm:px-5 pb-3 bg-background">
          <div className="flex items-center gap-2">
            {/* Search input */}
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                ref={searchRef}
                type="search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t("searchPlaceholder", lang)}
                className="w-full bg-secondary/60 border border-border/50 rounded-full pl-9 pr-9 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(""); searchRef.current?.focus(); }}
                  className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter button */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setFilterOpen(o => !o)}
                className={cn(
                  "relative flex items-center justify-center w-10 h-10 rounded-full border transition-all",
                  isFiltered
                    ? "bg-primary text-white border-primary shadow-md shadow-primary/30"
                    : "bg-secondary/60 text-muted-foreground border-border/50 hover:text-foreground hover:bg-secondary"
                )}
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>

              {filterOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setFilterOpen(false)} />
                  <div className="absolute right-0 top-12 z-50 bg-card border border-border/60 rounded-2xl shadow-xl overflow-hidden w-52 py-1.5">
                    <p className="px-4 pt-1 pb-2 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                      {lang === "en" ? "Sort by price" : "በዋጋ ደርድር"}
                    </p>
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => { setSortOrder(opt.key); setFilterOpen(false); }}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                          sortOrder === opt.key
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-foreground hover:bg-secondary/60"
                        )}
                      >
                        <span className={sortOrder === opt.key ? "text-primary" : "text-muted-foreground"}>
                          {opt.icon}
                        </span>
                        {lang === "en" ? opt.labelEn : opt.labelAm}
                        {sortOrder === opt.key && <span className="ml-auto text-primary text-xs font-bold">✓</span>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-3 min-[400px]:px-4 sm:px-5 py-4 sm:py-5 overflow-y-auto pb-28 bg-[#F8F5F2]">
        {filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
              <Search className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground text-base">{t("noResults", lang)}</p>
            <p className="text-sm text-muted-foreground">{t("noResultsSub", lang)}</p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-1 px-5 py-2 rounded-full bg-primary text-white text-sm font-semibold shadow-sm shadow-primary/30 active:scale-95 transition-transform"
            >
              <X className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5" />
              {lang === "en" ? "Clear search" : "ፍለጋ አጽዳ"}
            </button>
          </div>
        )}
        <div className="grid grid-cols-2 min-[560px]:grid-cols-3 gap-3 min-[400px]:gap-4 sm:gap-5 items-stretch">
          {filteredItems.map((item, index) => {
            const eager = index < 6;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="menu-card flex flex-col bg-card rounded-2xl overflow-hidden shadow-sm border border-border/40 text-left h-full"
                style={{ animationDelay: `${Math.min(index, 5) * 40}ms` }}
              >
                {/* Square-ish image — matches reference design */}
                <div className="relative overflow-hidden bg-muted w-full flex-shrink-0" style={{ paddingBottom: "88%" }}>
                  <img src={item.image} alt={gl(item.name)}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{
                      objectPosition: "center 35%",
                      filter: "brightness(1.06) saturate(1.10)",
                      transform: "scale(1.04)",
                    }}
                    loading={eager ? "eager" : "lazy"}
                    fetchPriority={eager ? "high" : "auto"}
                    decoding="async" />
                </div>
                <div className="px-3 pt-2.5 pb-3 flex flex-col flex-1 gap-1">
                  <h3 className="font-serif font-bold text-foreground leading-tight text-[0.85rem] min-[400px]:text-[0.92rem] line-clamp-2">{gl(item.name)}</h3>
                  <p className="text-[11px] min-[400px]:text-[12px] text-muted-foreground leading-snug line-clamp-2 flex-1">
                    {gl(item.description)}
                  </p>
                  <span className="font-bold text-primary text-[0.88rem] min-[400px]:text-[0.95rem] mt-auto pt-1.5">{item.price} ETB</span>
                </div>
              </button>
            );
          })}
        </div>
      </main>

      {/* Waiter button — fixed to bottom-right corner */}
      <div
        className="fixed bottom-0 right-0 z-30 p-4"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        {waiterCalled ? (
          <div className="relative flex items-center gap-2 bg-green-500 text-white px-4 py-3 rounded-2xl font-bold shadow-lg shadow-green-500/30 overflow-hidden"
            style={{ animation: "cardFadeIn 0.18s ease-out" }}>
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs tracking-wide uppercase">{t("waiterComing", lang)}</span>
            <div
              className="absolute bottom-0 left-0 h-0.5 bg-white/40 rounded-b-2xl"
              style={{ width: "100%", animation: "shrinkBar 4s linear forwards" }}
            />
          </div>
        ) : (
          <button
            onClick={() => callWaiter.mutate()}
            disabled={callWaiter.isPending}
            className="flex items-center gap-1.5 sm:gap-2 bg-[#C1440E] text-white px-3 py-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl font-bold shadow-lg shadow-[#C1440E]/40 active:scale-95 transition-transform disabled:opacity-60"
          >
            <Bell className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0", callWaiter.isPending && "animate-bounce")} />
            <span className="text-[11px] sm:text-xs tracking-wide uppercase whitespace-nowrap">
              {callWaiter.isPending ? t("calling", lang) : t("callWaiter", lang)}
            </span>
          </button>
        )}
      </div>
      <style>{`
        @keyframes shrinkBar { from { width: 100%; } to { width: 0%; } }
      `}</style>
    </div>
  );
}

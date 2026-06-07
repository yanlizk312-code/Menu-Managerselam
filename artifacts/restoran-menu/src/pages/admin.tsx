import React, { useState, useEffect } from "react";
import { INITIAL_MENU, INITIAL_CATEGORIES } from "@/lib/initial-data";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  LogOut, UtensilsCrossed, Table2, Layers, Plus, Pencil, Trash2,
  Check, X, Download, LayoutDashboard, Bell,
  Package, AlertCircle,
  Camera, Save, ChevronDown, Search, Eye, EyeOff, Menu as MenuIcon,
  Circle, Shield, KeyRound, Upload, ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { QRCodeCanvas } from "qrcode.react";

const API_BASE = "/api";

type Tab = "dashboard" | "menu" | "categories" | "tables" | "settings";
type Lang = "en" | "am";
type AdminLang = "en" | "am";

const T: Record<string, Record<AdminLang, string>> = {
  loginTitle:        { en: "Admin Login",                        am: "አስተዳዳሪ መግቢያ"              },
  loginSub:          { en: "Enter your PIN",                     am: "PIN ያስገቡ"                 },
  loginBtn:          { en: "Login →",                            am: "ግባ →"                     },
  verifying:         { en: "Verifying...",                       am: "እያረጋገጡ..."                },
  wrongPin:          { en: "Wrong PIN. Try again.",              am: "ስህተት PIN። እንደገና ሞክሩ።"    },
  backHome:          { en: "← Back to Home",                    am: "← ወደ ዋና ገጽ"              },
  logout:            { en: "Logout",                             am: "ውጣ"                       },
  dashboard:         { en: "Dashboard",                          am: "ዳሽቦርድ"                   },
  menuMgmt:          { en: "Menu Management",                    am: "ሜኑ አስተዳደር"               },
  categories:        { en: "Categories",                         am: "ምድቦች"                    },
  tableMgmt:         { en: "Table Management",                   am: "ጠረጴዛ አስተዳደር"             },
  menuShort:         { en: "Menu",                               am: "ሜኑ"                      },
  tablesShort:       { en: "Tables",                             am: "ጠረጴዛዎች"                 },
  totalItems:        { en: "Total Items",                        am: "ጠቅላላ ምርቶች"              },
  occupiedTbl:       { en: "Occupied Tables",                    am: "ተያዙ ጠረጴዛዎች"              },
  quickActions:      { en: "Quick Actions",                      am: "ፈጣን ድርጊቶች"              },
  addMenuItem:       { en: "Add Menu Item",                      am: "ሜኑ ምርት ጨምር"             },
  addTable:          { en: "Add Table",                          am: "ጠረጴዛ ጨምር"               },
  all:               { en: "All",                                am: "ሁሉም"                     },
  hidden:            { en: "Hidden",                             am: "የተደበቀ"                   },
  searchItems:       { en: "Search items…",                      am: "ምርቶች ፈልግ…"               },
  addItem:           { en: "Add Item",                           am: "ምርት ጨምር"                },
  add:               { en: "Add",                                am: "ጨምር"                     },
  noItems:           { en: "No items found",                     am: "ምንም ምርት አልተገኘም"         },
  noDesc:            { en: "No description",                     am: "መግለጫ የለም"               },
  show:              { en: "Show",                               am: "አሳይ"                     },
  hide:              { en: "Hide",                               am: "ደብቅ"                     },
  edit:              { en: "Edit",                               am: "አርትዕ"                   },
  delete:            { en: "Delete",                             am: "ሰርዝ"                    },
  editItem:          { en: "Edit Item",                          am: "ምርት አርትዕ"               },
  newItem:           { en: "New Item",                           am: "አዲስ ምርት"               },
  photo:             { en: "Photo",                              am: "ፎቶ"                     },
  uploading:         { en: "Uploading…",                         am: "እየጫነ..."                 },
  selectPhoto:       { en: "Select photo",                       am: "ፎቶ ምረጥ"                },
  uploadFailed:      { en: "Upload failed. Try again.",          am: "ጭነት አልተሳካም። እንደገና ሞክር።" },
  orPasteUrl:        { en: "or paste URL…",                      am: "ወይም URL ለጥፍ…"           },
  price:             { en: "Price (Br)",                         am: "ዋጋ (Br)"                },
  category:          { en: "Category",                           am: "ምድብ"                    },
  nameDesc:          { en: "Name & Description",                 am: "ስም እና መግለጫ"             },
  itemName:          { en: "ITEM NAME",                          am: "የምርት ስም"               },
  description:       { en: "DESCRIPTION",                        am: "መግለጫ"                  },
  requiredField:     { en: "Required field…",                    am: "አስፈላጊ መስክ…"             },
  cancel:            { en: "Cancel",                             am: "ሰርዝ"                    },
  saving:            { en: "Saving...",                          am: "እያስቀምጡ..."              },
  save:              { en: "Save",                               am: "አስቀምጥ"                 },
  changePhoto:       { en: "Change",                             am: "ቀይር"                   },
  noCats:            { en: "No categories yet",                  am: "ምንም ምድብ የለም"           },
  addFirstCat:       { en: "+ Add first category",              am: "+ የመጀመሪያ ምድብ ጨምር"      },
  addCat:            { en: "Add Category",                       am: "ምድብ ጨምር"               },
  editCatTitle:      { en: "Edit Category",                      am: "ምድብ አርትዕ"              },
  newCat:            { en: "New Category",                       am: "አዲስ ምድብ"              },
  tableCount:        { en: "tables registered",                  am: "ጠረጴዛዎች ተመዝግቧል"        },
  newTable:          { en: "New Table",                          am: "አዲስ ጠረጴዛ"             },
  location:          { en: "Location",                           am: "ቦታ"                    },
  optional:          { en: "(optional)",                         am: "(አማራጭ)"               },
  locPlaceholder:    { en: "E.g: Garden, Window, Indoor...",     am: "ምሳሌ: አትክልት፣ መስኮት፣ ውስጥ..." },
  adding:            { en: "Adding...",                          am: "እየጨመረ..."               },
  noTables:          { en: "No tables yet",                      am: "ምንም ጠረጴዛ የለም"         },
  noTablesSub:       { en: "Click \"Add Table\" above",          am: "ላይ ያለውን \"ጠረጴዛ ጨምር\" ይጫኑ" },
  table:             { en: "Table",                              am: "ጠረጴዛ"                  },
  downloadQr:        { en: "Download QR",                        am: "QR አውርድ"               },
  stAvailable:       { en: "Available",                          am: "ነጻ"                    },
  stOccupied:        { en: "Occupied",                           am: "ተያዟል"                  },
  stReserved:        { en: "Reserved",                           am: "ተጠብቋል"                 },
  confirmDelItem:    { en: "Delete this item?",                  am: "ይህን ምርት ሰርዝ?"          },
  confirmDelCat:     { en: "Delete this category?",              am: "ይህን ምድብ ሰርዝ?"          },
  confirmDelTable:   { en: "Delete this table?",                 am: "ይህን ጠረጴዛ ሰርዝ?"         },
  catLabel:          { en: "Categories",                         am: "ምድቦች"                  },
  catCountLabel:     { en: "categories",                         am: "ምድቦች"                  },
  settings:          { en: "Settings",                           am: "ቅንብሮች"                 },
  pinSecurity:       { en: "PIN Security",                       am: "PIN ደህንነት"              },
  adminPinLabel:     { en: "Admin PIN",                          am: "አስተዳዳሪ PIN"             },
  waiterPinLabel:    { en: "Waiter PIN",                         am: "አስተናጋጅ PIN"            },
  currentPin:        { en: "Current PIN",                        am: "አሁን ያለ PIN"             },
  newPin:            { en: "New PIN",                            am: "አዲስ PIN"               },
  confirmNewPin:     { en: "Confirm New PIN",                    am: "አዲስ PIN ያረጋግጡ"         },
  changePin:         { en: "Change PIN",                         am: "PIN ቀይር"               },
  pinChanged:        { en: "PIN updated successfully!",          am: "PIN በተሳካ ሁኔታ ተቀይሯል!"  },
  pinMismatch:       { en: "New PINs do not match.",             am: "አዲስ PINs አይዛመዱም።"      },
  pinWrong:          { en: "Current PIN is incorrect.",          am: "አሁን ያለ PIN ትክክል አይደለም።"},
  pinMinLen:         { en: "PIN must be at least 4 digits.",     am: "PIN ቢያንስ 4 ቁጥሮች ሊሆን ይገባዋል።"},
  changing:          { en: "Saving…",                            am: "እያስቀምጡ..."              },
  logoSection:       { en: "Restaurant Logo",                    am: "የሬስቶራንት አርማ"            },
  logoDesc:          { en: "Shown in the menu header on every table",am: "በሁሉም ጠረጴዛ ሜኑ ርዕስ ላይ ይታያል"},
  uploadLogo:        { en: "Upload Logo",                        am: "አርማ ጫን"                },
  changeLogo:        { en: "Change Logo",                        am: "አርማ ቀይር"               },
  removeLogo:        { en: "Remove Logo",                        am: "አርማ አስወግድ"             },
  logoUpdated:       { en: "Logo updated!",                      am: "አርማ ተቀይሯል!"            },
  logoRemoved:       { en: "Logo removed.",                      am: "አርማ ተወግዷል።"            },
  logoFailed:        { en: "Upload failed. Try again.",          am: "ጭነት አልተሳካም። እንደገና ሞክር።" },
  noLogo:            { en: "No logo set",                        am: "አርማ አልተቀናጀም"           },
};

interface LangMap { en: string; am: string; }
interface MenuItem { id: string; name: LangMap; description: LangMap; price: number; category: string; image: string; hidden?: boolean; }
interface Category { id: string; name: LangMap; order: number; }
interface Table { id: string; number: number; location: string; status: string; activeOrderCount: number; }

function getToken() { try { return localStorage.getItem("admin_token") || ""; } catch { return ""; } }
function storeToken(t: string) { try { localStorage.setItem("admin_token", t); } catch {} }
function clearToken() { try { localStorage.removeItem("admin_token"); } catch {} }
function authFetch(url: string, options: RequestInit = {}) {
  return fetch(url, { ...options, headers: { ...options.headers as Record<string, string>, "Authorization": `Bearer ${getToken()}`, "Content-Type": "application/json" } });
}
async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("image", file);
  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${getToken()}` },
    body: form,
  });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json() as { url: string };
  return data.url;
}

function resizeImageToBlob(file: File, scale: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 900;
      const factor = Math.min(MAX / img.width, MAX / img.height, 1) * scale;
      const w = Math.max(1, Math.round(img.width * factor));
      const h = Math.max(1, Math.round(img.height * factor));
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) { URL.revokeObjectURL(objectUrl); reject(new Error("no ctx")); return; }
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(objectUrl);
      canvas.toBlob(b => b ? resolve(b) : reject(new Error("blob failed")), "image/jpeg", 0.88);
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("load failed")); };
    img.src = objectUrl;
  });
}

function t(key: string, lang: AdminLang): string {
  return T[key]?.[lang] ?? key;
}

/* ═══════════════════════ LOGIN PAGE ═══════════════════════ */
export default function AdminPage() {
  const [pin, setPin] = useState("");
  const [isLogged, setIsLogged] = useState(() => !!getToken());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [, navigate] = useLocation();
  const [lang, setLang] = useState<AdminLang>(() => {
    try { const s = localStorage.getItem("admin_lang") as AdminLang; return (s === "en" || s === "am") ? s : "en"; } catch { return "en"; }
  });
  const updateLang = (l: AdminLang) => { setLang(l); try { localStorage.setItem("admin_lang", l); } catch {} };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "admin", pin })
    });
    setLoading(false);
    if (res.ok) {
      const { token } = await res.json();
      storeToken(token);
      setIsLogged(true);
      setError("");
    } else {
      setError(t("wrongPin", lang));
      setPin("");
    }
  };

  if (!isLogged) {
    return (
      <div className="min-h-[100dvh] bg-[#F8F5F0] flex items-center justify-center p-4"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-[#C1440E]/5" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#1B2A4A]/5" />
        </div>
        <button
          onClick={() => updateLang(lang === "en" ? "am" : "en")}
          className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 rounded-full text-xs font-bold text-stone-600 shadow-sm touch-manipulation"
        >
          {lang === "en" ? "🇬🇧 EN" : "🇪🇹 AM"}
        </button>
        <div className="relative w-full max-w-sm">
          <div className="bg-white rounded-3xl shadow-2xl shadow-stone-200/80 overflow-hidden">
            <div className="bg-[#0f172a] px-8 py-7 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.3) 10px, rgba(255,255,255,0.3) 11px)" }} />
              <div className="relative">
                <p className="text-[#D4AF37]/70 text-[10px] tracking-[0.4em] font-bold mb-1">مطعم</p>
                <h1 className="text-white text-2xl font-serif font-bold tracking-[0.12em]">AL-RISALA</h1>
                <p className="text-white/40 text-xs tracking-[0.25em] mt-1">الرسالة</p>
                <div className="flex items-center gap-3 justify-center mt-3">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#D4AF37]/40" />
                  <span className="text-[#D4AF37]/60 text-[9px]">✦</span>
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#D4AF37]/40" />
                </div>
              </div>
            </div>
            <div className="px-6 sm:px-8 py-8">
              <div className="mb-6 text-center">
                <h2 className="text-xl font-bold text-[#1B2A4A]">{t("loginTitle", lang)}</h2>
                <p className="text-stone-400 text-sm mt-1">{t("loginSub", lang)}</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="password"
                  inputMode="numeric"
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  placeholder="• • • •"
                  className="w-full border-2 border-stone-200 focus:border-[#C1440E] bg-stone-50 text-center text-4xl tracking-[0.6em] text-[#1B2A4A] rounded-2xl py-5 outline-none transition-colors font-bold placeholder:text-stone-300 placeholder:tracking-[0.5em] placeholder:text-2xl"
                  autoFocus
                />
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-xl text-sm"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
                    </motion.div>
                  )}
                </AnimatePresence>
                <button
                  type="submit"
                  disabled={loading || !pin}
                  className="w-full bg-[#C1440E] hover:bg-[#a83a0c] active:bg-[#a83a0c] text-white font-semibold py-4 rounded-2xl transition-colors disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg shadow-[#C1440E]/20 touch-manipulation"
                >
                  {loading ? <><Circle className="w-4 h-4 animate-spin" />{t("verifying", lang)}</> : t("loginBtn", lang)}
                </button>
              </form>
              <button onClick={() => navigate("/")} className="w-full text-stone-400 hover:text-stone-600 text-sm py-3 mt-3 transition-colors touch-manipulation">
                {t("backHome", lang)}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <AdminDashboard lang={lang} updateLang={updateLang} onLogout={() => { clearToken(); setIsLogged(false); navigate("/"); }} />;
}

/* ═══════════════════════ LAYOUT ═══════════════════════ */
function AdminDashboard({ onLogout, lang, updateLang }: { onLogout: () => void; lang: AdminLang; updateLang: (l: AdminLang) => void }) {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { setSidebarOpen(false); }, [activeTab]);

  const navItems: { id: Tab; label: string; shortLabel: string; icon: React.ReactNode }[] = [
    { id: "dashboard",  label: t("dashboard", lang),   shortLabel: lang === "en" ? "Dash" : "ዳሽ",  icon: <LayoutDashboard className="w-[18px] h-[18px]" /> },
    { id: "menu",       label: t("menuShort", lang),   shortLabel: t("menuShort", lang),             icon: <UtensilsCrossed className="w-[18px] h-[18px]" /> },
    { id: "categories", label: t("categories", lang),  shortLabel: lang === "en" ? "Cat." : "ምድ.",  icon: <Layers className="w-[18px] h-[18px]" /> },
    { id: "tables",     label: t("tablesShort", lang), shortLabel: lang === "en" ? "Tbl." : "ጠ.",    icon: <Table2 className="w-[18px] h-[18px]" /> },
    { id: "settings",   label: t("settings", lang),    shortLabel: lang === "en" ? "Set." : "ቅን.",   icon: <Shield className="w-[18px] h-[18px]" /> },
  ];

  const titles: Record<Tab, string> = {
    dashboard: t("dashboard", lang), menu: t("menuMgmt", lang), categories: t("categories", lang),
    tables: t("tableMgmt", lang), settings: t("settings", lang),
  };

  const activeItem = navItems.find(n => n.id === activeTab)!;

  return (
    <div className="h-[100dvh] bg-[#F0F2F5] flex overflow-hidden">

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-[2px]"
          />
        )}
      </AnimatePresence>

      <aside className={cn(
        "fixed top-0 left-0 h-full w-[240px] bg-[#0f172a] flex flex-col z-50 transition-transform duration-300 ease-in-out",
        "lg:translate-x-0 lg:relative lg:flex lg:flex-shrink-0",
        sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      )}>
        <div className="px-4 py-5 flex items-center justify-between flex-shrink-0"
          style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#C1440E] rounded-lg flex items-center justify-center flex-shrink-0">
              <UtensilsCrossed className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none tracking-wide">AL-RISALA</p>
              <p className="text-white/30 text-[10px] mt-0.5 tracking-wide">Admin Panel</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/30 hover:text-white/70 transition-colors p-1.5 rounded-lg touch-manipulation">
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left touch-manipulation",
                  isActive
                    ? "bg-white/10 text-white font-medium border border-white/8"
                    : "text-white/40 hover:text-white/70 hover:bg-white/5 active:bg-white/8"
                )}
              >
                <span className={cn("flex-shrink-0 w-[18px] h-[18px]", isActive ? "text-[#C1440E]" : "text-white/35")}>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {isActive && <span className="w-1 h-4 bg-[#C1440E] rounded-full flex-shrink-0" />}
              </button>
            );
          })}
        </nav>

        <div className="mx-3 border-t border-white/8" />

        <div className="px-3 py-3 flex-shrink-0"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
          <button
            onClick={() => updateLang(lang === "en" ? "am" : "en")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/35 hover:text-white/60 hover:bg-white/5 transition-all touch-manipulation mb-1"
          >
            <span className="text-base">{lang === "en" ? "🇬🇧" : "🇪🇹"}</span>
            <span>{lang === "en" ? "English" : "አማርኛ"}</span>
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/35 hover:text-white/60 hover:bg-white/5 transition-all touch-manipulation"
          >
            <LogOut className="w-4 h-4" />{t("logout", lang)}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="lg:hidden bg-[#0f172a] px-4 flex items-center gap-3 sticky top-0 z-30 flex-shrink-0"
          style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))", paddingBottom: "0.75rem" }}>
          <button onClick={() => setSidebarOpen(true)} className="text-white/50 hover:text-white transition-colors p-2 -ml-2 rounded-lg touch-manipulation">
            <MenuIcon className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-[#C1440E] flex-shrink-0">{activeItem.icon}</span>
            <h1 className="text-white font-semibold text-base truncate">{titles[activeTab]}</h1>
          </div>
        </header>

        <header className="hidden lg:flex bg-white border-b border-slate-200/60 px-8 py-3.5 items-center gap-4 sticky top-0 z-10 flex-shrink-0 shadow-sm shadow-slate-100">
          <div className="flex-1 flex items-center gap-3">
            <span className="text-[#C1440E]">{activeItem.icon}</span>
            <h1 className="text-lg font-bold text-slate-800">{titles[activeTab]}</h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overscroll-contain" style={{
          paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))"
        }}>
          <div className="p-4 sm:p-5 lg:p-7 max-w-7xl">
            <div>
              {activeTab === "dashboard"  && <DashboardTab setActiveTab={setActiveTab} lang={lang} />}
              {activeTab === "menu"       && <MenuTab lang={lang} />}
              {activeTab === "categories" && <CategoriesTab lang={lang} />}
              {activeTab === "tables"     && <TablesTab lang={lang} />}
              {activeTab === "settings"   && <SettingsTab lang={lang} />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ═══════════════════════ DASHBOARD TAB ═══════════════════════ */
function DashboardTab({ setActiveTab, lang }: { setActiveTab: (t: Tab) => void; lang: AdminLang }) {
  const { data: menu = [] }   = useQuery<MenuItem[]>({ queryKey: ["admin-menu"],   queryFn: async () => { const r = await fetch(`${API_BASE}/menu`); return r.json(); }, placeholderData: INITIAL_MENU as unknown as MenuItem[], staleTime: 30_000 });
  const { data: tables = [] } = useQuery<Table[]>({    queryKey: ["admin-tables"], queryFn: async () => { const r = await authFetch(`${API_BASE}/tables`); return r.json(); }, staleTime: 30_000 });

  const occupiedTables = tables.filter(tb => tb.status === "occupied").length;

  const stats = [
    { label: t("totalItems", lang),  value: menu.length,                         icon: <Package className="w-5 h-5" />, color: "bg-violet-50 text-violet-600", tab: "menu" as Tab },
    { label: t("occupiedTbl", lang), value: `${occupiedTables}/${tables.length}`, icon: <Table2 className="w-5 h-5" />,  color: "bg-blue-50 text-blue-600",     tab: "tables" as Tab },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s, i) => (
          <div
            key={i}
            onClick={() => s.tab && setActiveTab(s.tab)}
            className={cn(
              "bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3",
              s.tab && "cursor-pointer hover:shadow-md active:shadow-md transition-all touch-manipulation"
            )}
          >
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", s.color)}>{s.icon}</div>
            <div>
              <p className="text-2xl font-bold text-[#1B2A4A] leading-none">{s.value}</p>
              <p className="text-slate-400 text-xs mt-1 leading-tight">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-2">
        <h3 className="font-bold text-[#1B2A4A] text-sm mb-3">{t("quickActions", lang)}</h3>
        {[
          { label: t("addMenuItem", lang), tab: "menu" as Tab,   icon: <UtensilsCrossed className="w-4 h-4" /> },
          { label: t("addTable", lang),    tab: "tables" as Tab, icon: <Table2 className="w-4 h-4" /> },
        ].map((a, i) => (
          <button key={i} onClick={() => setActiveTab(a.tab)}
            className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-[#1B2A4A] hover:text-white active:bg-[#1B2A4A] active:text-white rounded-xl text-sm font-medium text-slate-600 transition-colors group touch-manipulation">
            <span className="text-[#1B2A4A] group-hover:text-white group-active:text-white transition-colors">{a.icon}</span>
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════ MENU TAB ═══════════════════════ */
function MenuTab({ lang }: { lang: AdminLang }) {
  const queryClient = useQueryClient();
  const [editItem, setEditItem]     = useState<MenuItem | null>(null);
  const [showForm, setShowForm]     = useState(false);
  const [filterCat, setFilterCat]   = useState("all");
  const [showHidden, setShowHidden] = useState(false);
  const [search, setSearch]         = useState("");

  const { data: menu = [] } = useQuery<MenuItem[]>({
    queryKey: ["admin-menu"],
    queryFn: async () => { const r = await fetch(`${API_BASE}/menu?showHidden=1`); return r.json(); },
    placeholderData: INITIAL_MENU as unknown as MenuItem[],
    staleTime: 30_000,
  });
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["admin-categories"],
    queryFn: async () => { const r = await fetch(`${API_BASE}/categories`); return r.json(); },
    placeholderData: INITIAL_CATEGORIES as unknown as Category[],
    staleTime: 30_000,
  });

  function clearBundleCache() { try { localStorage.removeItem("al_bundle_v2"); } catch {} }

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await authFetch(`${API_BASE}/menu/${id}`, { method: "DELETE" }); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-menu"] }); clearBundleCache(); }
  });
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const isEdit = !!data.id && menu.some(m => m.id === data.id);
      await authFetch(isEdit ? `${API_BASE}/menu/${data.id}` : `${API_BASE}/menu`, { method: isEdit ? "PUT" : "POST", body: JSON.stringify(data) });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-menu"] }); clearBundleCache(); setShowForm(false); setEditItem(null); }
  });
  const toggleHiddenMutation = useMutation({
    mutationFn: async ({ id, hidden }: { id: string; hidden: boolean }) => {
      await authFetch(`${API_BASE}/menu/${id}`, { method: "PATCH", body: JSON.stringify({ hidden }) });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-menu"] }); clearBundleCache(); }
  });

  const visibleMenu = menu.filter(m => !m.hidden);
  const hiddenItems = menu.filter(m => m.hidden);

  const q = search.trim().toLowerCase();
  const displayItems = (showHidden ? hiddenItems : visibleMenu).filter(item => {
    if (filterCat !== "all" && item.category !== filterCat) return false;
    if (q && !item.name?.en?.toLowerCase().includes(q) && !item.name?.am?.toLowerCase().includes(q)) return false;
    return true;
  });

  function catCount(catId: string) {
    const src = showHidden ? hiddenItems : visibleMenu;
    return catId === "all" ? src.length : src.filter(m => m.category === catId).length;
  }

  const itemName = (item: MenuItem) => item.name?.[lang] || item.name?.en || "";
  const itemDesc = (item: MenuItem) => item.description?.[lang] || item.description?.en || "";
  const catName  = (cat: Category) => cat.name?.[lang] || cat.name?.en || cat.id;

  return (
    <div className="flex gap-5 min-h-[70vh]">
      <aside className="hidden lg:flex flex-col w-52 flex-shrink-0 gap-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-1">{t("catLabel", lang)}</p>

        <button
          onClick={() => { setFilterCat("all"); setShowHidden(false); }}
          className={cn(
            "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left touch-manipulation",
            !showHidden && filterCat === "all"
              ? "bg-[#C1440E] text-white shadow-sm shadow-[#C1440E]/20"
              : "text-slate-600 hover:bg-white hover:shadow-sm"
          )}
        >
          <span>{t("all", lang)}</span>
          <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded-md", !showHidden && filterCat === "all" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500")}>
            {visibleMenu.length}
          </span>
        </button>

        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => { setFilterCat(cat.id); setShowHidden(false); }}
            className={cn(
              "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left touch-manipulation",
              !showHidden && filterCat === cat.id
                ? "bg-[#C1440E] text-white shadow-sm shadow-[#C1440E]/20"
                : "text-slate-600 hover:bg-white hover:shadow-sm"
            )}
          >
            <span className="truncate">{catName(cat)}</span>
            <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 ml-1", !showHidden && filterCat === cat.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500")}>
              {catCount(cat.id)}
            </span>
          </button>
        ))}

        {hiddenItems.length > 0 && (
          <>
            <div className="my-2 border-t border-slate-200" />
            <button
              onClick={() => { setShowHidden(true); setFilterCat("all"); }}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left touch-manipulation",
                showHidden
                  ? "bg-slate-700 text-white"
                  : "text-slate-500 hover:bg-white hover:shadow-sm"
              )}
            >
              <span className="flex items-center gap-1.5"><EyeOff className="w-3.5 h-3.5" />{t("hidden", lang)}</span>
              <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded-md", showHidden ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500")}>
                {hiddenItems.length}
              </span>
            </button>
          </>
        )}
      </aside>

      <div className="flex-1 min-w-0 space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t("searchItems", lang)}
              className="w-full bg-white border border-stone-200 focus:border-[#C1440E] rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-700 outline-none transition-colors"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 touch-manipulation">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={() => { setEditItem(null); setShowForm(true); }}
            className="flex items-center gap-2 bg-[#C1440E] hover:bg-[#a83a0c] text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm shadow-[#C1440E]/20 touch-manipulation flex-shrink-0"
          >
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">{t("addItem", lang)}</span><span className="sm:hidden">{t("add", lang)}</span>
          </button>
        </div>

        {/* Mobile category pills */}
        <div className="lg:hidden -mx-1 px-1 overflow-x-auto">
          <div className="flex gap-2 pb-1" style={{ width: "max-content" }}>
            <button
              onClick={() => { setFilterCat("all"); setShowHidden(false); }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap touch-manipulation",
                !showHidden && filterCat === "all"
                  ? "bg-[#C1440E] text-white"
                  : "bg-white border border-stone-200 text-slate-600"
              )}
            >
              {t("all", lang)} <span className="text-[11px] opacity-70">({visibleMenu.length})</span>
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => { setFilterCat(cat.id); setShowHidden(false); }}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap touch-manipulation",
                  !showHidden && filterCat === cat.id
                    ? "bg-[#C1440E] text-white"
                    : "bg-white border border-stone-200 text-slate-600"
                )}
              >
                {catName(cat)} <span className="text-[11px] opacity-70">({visibleMenu.filter(m => m.category === cat.id).length})</span>
              </button>
            ))}
            {hiddenItems.length > 0 && (
              <button
                onClick={() => { setShowHidden(true); setFilterCat("all"); }}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap touch-manipulation flex items-center gap-1.5",
                  showHidden
                    ? "bg-slate-700 text-white"
                    : "bg-white border border-dashed border-slate-300 text-slate-500"
                )}
              >
                <EyeOff className="w-3.5 h-3.5" /> {t("hidden", lang)} <span className="text-[11px] opacity-70">({hiddenItems.length})</span>
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          {displayItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-stone-300">
              <Search className="w-10 h-10 mb-3" />
              <p className="text-stone-400 font-semibold text-sm">{t("noItems", lang)}</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-50">
              <AnimatePresence initial={false}>
                {displayItems.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                    transition={{ duration: 0.12, delay: idx * 0.01 }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 hover:bg-slate-50/80 transition-colors group",
                      showHidden && "opacity-60"
                    )}
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-stone-100">
                      {item.image
                        ? <img src={item.image} alt={itemName(item)} className="w-full h-full object-cover" loading="lazy" />
                        : <div className="w-full h-full flex items-center justify-center"><Camera className="w-5 h-5 text-stone-300" /></div>
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{itemName(item)}</p>
                      <p className="text-stone-400 text-xs truncate mt-0.5">
                        {itemDesc(item) || <span className="italic">{t("noDesc", lang)}</span>}
                      </p>
                    </div>

                    <span className="hidden sm:block text-xs text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg flex-shrink-0 capitalize max-w-[90px] truncate">
                      {catName(categories.find(c => c.id === item.category) || { id: item.category, name: { en: item.category, am: item.category }, order: 0 })}
                    </span>

                    <span className="font-bold text-[#C1440E] text-sm flex-shrink-0 w-16 text-right">
                      {item.price} Br
                    </span>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {showHidden ? (
                        <button
                          onClick={() => toggleHiddenMutation.mutate({ id: item.id, hidden: false })}
                          title={t("show", lang)}
                          className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors touch-manipulation"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleHiddenMutation.mutate({ id: item.id, hidden: true })}
                          title={t("hide", lang)}
                          className="p-2 rounded-lg bg-amber-50 text-amber-500 hover:bg-amber-100 transition-colors touch-manipulation"
                        >
                          <EyeOff className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => { setEditItem(item); setShowForm(true); }}
                        title={t("edit", lang)}
                        className="p-2 rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors touch-manipulation"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { if (confirm(t("confirmDelItem", lang))) deleteMutation.mutate(item.id); }}
                        title={t("delete", lang)}
                        className="p-2 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors touch-manipulation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <MenuItemForm
          categories={categories}
          initialData={editItem}
          onSave={d => saveMutation.mutate(d)}
          onCancel={() => { setShowForm(false); setEditItem(null); }}
          isSaving={saveMutation.isPending}
          lang={lang}
        />
      )}
    </div>
  );
}

/* ─── Input style (shared) ─── */
const inputCls = "w-full border-2 border-slate-200 focus:border-[#C1440E] bg-slate-50 focus:bg-white rounded-lg px-3 py-2 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-300";
const selectCls = "w-full border-2 border-slate-200 focus:border-[#C1440E] bg-slate-50 focus:bg-white rounded-lg px-3 py-2 text-sm text-slate-800 outline-none transition-colors appearance-none";

function MenuItemForm({ categories, initialData, onSave, onCancel, isSaving, lang }: {
  categories: Category[]; initialData: MenuItem | null;
  onSave: (d: any) => void; onCancel: () => void; isSaving: boolean; lang: AdminLang;
}) {
  const [price, setPrice]   = useState(initialData?.price?.toString() || "");
  const [category, setCat]  = useState(initialData?.category || categories[0]?.id || "");
  const [image, setImage]   = useState(initialData?.image || "");
  const [nameEn, setNameEn] = useState(initialData?.name?.en || "");
  const [nameAm, setNameAm] = useState(initialData?.name?.am || "");
  const [descEn, setDescEn] = useState(initialData?.description?.en || "");
  const [descAm, setDescAm] = useState(initialData?.description?.am || "");
  const [uploading, setUploading]     = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl]   = useState("");
  const [cropScale, setCropScale]     = useState(1);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!pendingFile) { setPreviewUrl(""); return; }
    const url = URL.createObjectURL(pendingFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingFile]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    setPendingFile(file);
    setCropScale(1);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleCropUpload() {
    if (!pendingFile) return;
    setUploading(true); setUploadError("");
    try {
      const blob = await resizeImageToBlob(pendingFile, cropScale);
      const resized = new File([blob], pendingFile.name, { type: "image/jpeg" });
      const url = await uploadImage(resized);
      setImage(url);
      setPendingFile(null);
    } catch {
      setUploadError(t("uploadFailed", lang));
    } finally {
      setUploading(false);
    }
  }

  const catName = (cat: Category) => cat.name?.[lang] || cat.name?.en || cat.id;

  function handleSave() {
    const base = nameEn || nameAm || `item-${Date.now()}`;
    const id = initialData?.id || base.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 48) || `item-${Date.now()}`;
    const nameMap: LangMap = { en: nameEn, am: nameAm };
    const descMap: LangMap = { en: descEn, am: descAm };
    onSave({ id, name: nameMap, description: descMap, price: Number(price), category, image });
  }

  const canSave = !isSaving && !!nameEn && !!price;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={e => e.target === e.currentTarget && onCancel()}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-xl overflow-hidden flex flex-col"
        style={{ maxHeight: "94dvh" }}
      >
        {/* Drag handle — mobile */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-stone-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 flex-shrink-0">
          <h3 className="font-bold text-[#1B2A4A] text-sm">{initialData ? t("editItem", lang) : t("newItem", lang)}</h3>
          <button onClick={onCancel} className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-400 transition-colors touch-manipulation">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 overscroll-contain">
          <div className="p-4 space-y-4">

            {/* ── Row 1: Photo + Price & Category side by side ── */}
            <div className="flex gap-3">
              {/* Photo */}
              <div className="flex-shrink-0">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">{t("photo", lang)}</p>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" className="hidden" onChange={handleFileChange} />
                <div
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  className={cn(
                    "relative w-24 h-24 rounded-xl border-2 border-dashed overflow-hidden cursor-pointer transition-colors group touch-manipulation",
                    image ? "border-slate-200" : "border-slate-300 hover:border-[#C1440E]/60 bg-slate-50"
                  )}
                >
                  {image ? (
                    <>
                      <img src={image} alt="" className="w-full h-full object-cover group-hover:opacity-70 transition-opacity" loading="lazy" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                        <Camera className="w-5 h-5 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                      {uploading
                        ? <div className="w-5 h-5 border-2 border-[#C1440E]/40 border-t-[#C1440E] rounded-full animate-spin" />
                        : <Camera className="w-6 h-6 text-slate-300" />}
                      <span className="text-[10px] text-slate-400 text-center leading-tight px-1">
                        {uploading ? t("uploading", lang) : t("selectPhoto", lang)}
                      </span>
                    </div>
                  )}
                </div>
                {uploadError && <p className="text-red-500 text-[10px] mt-1">{uploadError}</p>}

                {/* Image resize/preview modal */}
                {pendingFile && previewUrl && (
                  <div className="fixed inset-0 bg-black/75 z-[200] flex items-end sm:items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                        <h4 className="font-bold text-[#1B2A4A] text-sm">
                          {lang === "en" ? "Adjust Photo" : "ፎቶ አስተካክል"}
                        </h4>
                        <button onClick={() => setPendingFile(null)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="rounded-xl overflow-hidden bg-slate-100" style={{ aspectRatio: "1/1" }}>
                          <img
                            src={previewUrl}
                            alt=""
                            className="w-full h-full object-cover transition-transform"
                            style={{ transform: `scale(${cropScale})`, transformOrigin: "center" }}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px] text-slate-500">
                            <span>{lang === "en" ? "Zoom" : "ማጉሊያ"}</span>
                            <span>{Math.round(cropScale * 100)}%</span>
                          </div>
                          <input
                            type="range" min="1" max="2.5" step="0.05"
                            value={cropScale}
                            onChange={e => setCropScale(Number(e.target.value))}
                            className="w-full accent-[#C1440E] h-1.5 cursor-pointer"
                          />
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>1×</span><span>2.5×</span>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => setPendingFile(null)}
                            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 font-medium touch-manipulation"
                          >
                            {lang === "en" ? "Cancel" : "ሰርዝ"}
                          </button>
                          <button
                            onClick={handleCropUpload}
                            disabled={uploading}
                            className="flex-1 py-2.5 rounded-xl bg-[#C1440E] text-white text-sm font-semibold touch-manipulation disabled:opacity-60 flex items-center justify-center gap-2"
                          >
                            {uploading
                              ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />{t("uploading", lang)}</>
                              : (lang === "en" ? "Upload" : "ጫን")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Price + Category stacked */}
              <div className="flex-1 flex flex-col gap-2 justify-center">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
                    {t("price", lang)} <span className="text-[#C1440E]">*</span>
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className={inputCls}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">{t("category", lang)}</label>
                  <div className="relative">
                    <select value={category} onChange={e => setCat(e.target.value)} className={selectCls}>
                      {categories.map(c => <option key={c.id} value={c.id}>{catName(c)}</option>)}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Row 2: English & Amharic side by side ── */}
            <div className="grid grid-cols-2 gap-3">
              {/* English */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🇬🇧</span>
                  <span className="text-xs font-bold text-[#1B2A4A]">English</span>
                  <span className="text-[#C1440E] text-xs font-bold">*</span>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">{t("itemName", lang)}</label>
                  <input
                    value={nameEn}
                    onChange={e => setNameEn(e.target.value)}
                    className={inputCls}
                    placeholder="e.g. Grilled Chicken"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">{t("description", lang)}</label>
                  <textarea
                    value={descEn}
                    onChange={e => setDescEn(e.target.value)}
                    className={cn(inputCls, "resize-none")}
                    rows={3}
                    placeholder="e.g. Tender grilled chicken with herbs"
                  />
                </div>
              </div>

              {/* Amharic */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🇪🇹</span>
                  <span className="text-xs font-bold text-[#1B2A4A]">አማርኛ</span>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">{t("itemName", lang)}</label>
                  <input
                    value={nameAm}
                    onChange={e => setNameAm(e.target.value)}
                    className={inputCls}
                    placeholder="ምሳሌ፦ የተጠበሰ ዶሮ"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">{t("description", lang)}</label>
                  <textarea
                    value={descAm}
                    onChange={e => setDescAm(e.target.value)}
                    className={cn(inputCls, "resize-none")}
                    rows={3}
                    placeholder="ምሳሌ፦ ከዕፅዋት ጋር የተጠበሰ ዶሮ"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div
          className="px-4 py-3 border-t border-stone-100 flex items-center justify-end gap-2 flex-shrink-0 bg-white"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <button onClick={onCancel} className="px-4 py-2 text-stone-500 hover:bg-stone-100 rounded-lg text-sm transition-colors font-medium touch-manipulation">
            {t("cancel", lang)}
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex items-center gap-1.5 bg-[#C1440E] hover:bg-[#a83a0c] text-white px-5 py-2 rounded-lg font-semibold text-sm disabled:opacity-40 transition-colors shadow-sm shadow-[#C1440E]/20 touch-manipulation"
          >
            <Save className="w-3.5 h-3.5" />{isSaving ? t("saving", lang) : t("save", lang)}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* Numbered section header */
function SectionHeader({ n, label, flag }: { n: number; label: string; flag?: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <span className="w-6 h-6 rounded-full bg-[#1B2A4A] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">
        {n}
      </span>
      {flag && <span className="text-base">{flag}</span>}
      <span className="text-sm font-bold text-[#1B2A4A]">{label}</span>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  );
}

function FormField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline gap-1.5">
        <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">{label}</label>
        {hint && <span className="text-[#C1440E] text-xs font-bold">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

/* ═══════════════════════ CATEGORIES TAB ═══════════════════════ */
function CategoriesTab({ lang }: { lang: AdminLang }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editCat, setEditCat]   = useState<Category | null>(null);
  const [form, setForm]         = useState({ id: "", en: "", am: "" });

  const { data: categories = [] } = useQuery<Category[]>({ queryKey: ["admin-categories"], queryFn: async () => { const r = await fetch(`${API_BASE}/categories`); return r.json(); }, placeholderData: INITIAL_CATEGORIES as unknown as Category[], staleTime: 30_000 });
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const isEdit = !!editCat;
      await authFetch(isEdit ? `${API_BASE}/categories/${editCat!.id}` : `${API_BASE}/categories`, { method: isEdit ? "PUT" : "POST", body: JSON.stringify(data) });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-categories"] }); setShowForm(false); setEditCat(null); }
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await authFetch(`${API_BASE}/categories/${id}`, { method: "DELETE" }); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-categories"] })
  });

  function openAdd() { setEditCat(null); setForm({ id: "", en: "", am: "" }); setShowForm(true); }

  const catName = (cat: Category) => cat.name?.[lang] || cat.name?.en || cat.id;

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          <span className="font-semibold text-slate-700">{categories.length}</span> {t("catCountLabel", lang)}
        </p>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#C1440E] hover:bg-[#a83a0c] text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm shadow-[#C1440E]/20 touch-manipulation"
        >
          <Plus className="w-4 h-4" /> {t("addCat", lang)}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">
                {editCat ? t("editCatTitle", lang) : t("newCat", lang)}
              </h3>
              <button
                onClick={() => { setShowForm(false); setEditCat(null); }}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors touch-manipulation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {/* English */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  🇬🇧 English <span className="text-[#C1440E]">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    value={form.en}
                    onChange={e => setForm({ ...form, en: e.target.value })}
                    className={inputCls}
                    placeholder="e.g. Starters"
                  />
                  {form.en && <Check className="w-4 h-4 text-green-500 flex-shrink-0" />}
                </div>
              </div>
              {/* Amharic */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  🇪🇹 አማርኛ
                </label>
                <div className="flex items-center gap-2">
                  <input
                    value={form.am}
                    onChange={e => setForm({ ...form, am: e.target.value })}
                    className={inputCls}
                    placeholder="ምሳሌ፦ ቀዳሚ ምግቦች"
                  />
                  {form.am && <Check className="w-4 h-4 text-green-500 flex-shrink-0" />}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    const base = form.en || form.am || `cat-${Date.now()}`;
                    const id = editCat?.id || base.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 48) || `cat-${Date.now()}`;
                    saveMutation.mutate({ id, name: { en: form.en, am: form.am }, order: editCat?.order || categories.length + 1 });
                  }}
                  disabled={saveMutation.isPending || !form.en}
                  className="flex items-center gap-2 bg-[#C1440E] hover:bg-[#a83a0c] text-white px-5 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-40 transition-colors touch-manipulation"
                >
                  <Save className="w-4 h-4" />{saveMutation.isPending ? t("saving", lang) : t("save", lang)}
                </button>
                <button
                  onClick={() => { setShowForm(false); setEditCat(null); }}
                  className="px-4 py-2.5 text-slate-400 hover:bg-slate-100 rounded-xl text-sm transition-colors touch-manipulation"
                >
                  {t("cancel", lang)}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-300">
            <Layers className="w-10 h-10 mb-3" />
            <p className="text-slate-400 font-semibold text-sm">{t("noCats", lang)}</p>
            <button onClick={openAdd} className="mt-3 text-[#C1440E] text-sm font-semibold hover:underline touch-manipulation">{t("addFirstCat", lang)}</button>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {categories.map((cat, i) => (
              <div
                key={cat.id}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors group",
                  editCat?.id === cat.id && showForm && "bg-orange-50/40"
                )}
              >
                <span className="w-6 text-center text-xs font-bold text-slate-300 flex-shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm">{catName(cat)}</p>
                  <p className="text-slate-400 text-xs truncate mt-0.5">
                    {[cat.name?.en, cat.name?.am].filter(Boolean).join("  ·  ")}
                  </p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => {
                      if (editCat?.id === cat.id && showForm) { setShowForm(false); setEditCat(null); return; }
                      setEditCat(cat);
                      setForm({ id: cat.id, en: cat.name.en, am: cat.name.am });
                      setShowForm(true);
                    }}
                    className={cn(
                      "p-2 rounded-lg transition-colors touch-manipulation",
                      editCat?.id === cat.id && showForm
                        ? "bg-[#C1440E] text-white"
                        : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    )}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => { if (confirm(t("confirmDelCat", lang))) deleteMutation.mutate(cat.id); }}
                    className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors touch-manipulation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════ TABLES TAB ═══════════════════════ */
function TablesTab({ lang }: { lang: AdminLang }) {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [newLoc, setNewLoc]   = useState("");

  const { data: tables = [] } = useQuery<Table[]>({ queryKey: ["admin-tables"], queryFn: async () => { const r = await authFetch(`${API_BASE}/tables`); return r.json(); }, staleTime: 30_000 });
  const addMutation = useMutation({
    mutationFn: async () => { await authFetch(`${API_BASE}/tables`, { method: "POST", body: JSON.stringify({ name: `Table ${(tables.length || 0) + 1}`, location: newLoc || "Indoor" }) }); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-tables"] }); setShowAdd(false); setNewLoc(""); }
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await authFetch(`${API_BASE}/tables/${id}`, { method: "DELETE" }); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-tables"] })
  });

  const statusColor: Record<string, string> = {
    available: "bg-green-100 text-green-700 border-green-200",
    occupied:  "bg-amber-100 text-amber-700 border-amber-200",
    reserved:  "bg-blue-100 text-blue-700 border-blue-200",
  };
  const statusLabel: Record<string, string> = {
    available: t("stAvailable", lang),
    occupied:  t("stOccupied", lang),
    reserved:  t("stReserved", lang),
  };

  function getQrUrl(tableId: string) {
    return `${window.location.origin}/masa/${tableId}?qr=true`;
  }

  function downloadQr(tableId: string, tableNumber: number) {
    const qrCanvas = document.getElementById(`table-qr-dl-${tableId}`) as HTMLCanvasElement;
    if (!qrCanvas) return;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOS) {
      // iOS Safari can't download blobs — open data URL in new tab, user long-presses to save
      const dataUrl = qrCanvas.toDataURL("image/png");
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(
          `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
          <title>Masa ${tableNumber} QR</title>
          <style>body{margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:#f8f5f2;font-family:sans-serif;padding:20px;box-sizing:border-box}
          img{max-width:280px;width:100%;border:1px solid #eee;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,.1)}
          p{color:#555;font-size:14px;margin-top:16px;text-align:center}</style></head>
          <body><img src="${dataUrl}" alt="QR Masa ${tableNumber}"/><p>Basılı tutun → Fotoğraflara kaydet</p></body></html>`
        );
        win.document.close();
      }
    } else {
      qrCanvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `al-risala-masa-${tableNumber}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1500);
      }, "image/png");
    }
  }

  return (
    <div className="space-y-5" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-[#1B2A4A] text-base sm:text-lg">{t("tableMgmt", lang)}</h2>
          <p className="text-slate-400 text-xs mt-0.5">{tables.length} {t("tableCount", lang)}</p>
        </div>
        <button
          onClick={() => setShowAdd(v => !v)}
          className="flex items-center gap-2 bg-[#1B2A4A] text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#243760] active:bg-[#243760] transition-colors touch-manipulation shadow-sm"
        >
          <Plus className="w-4 h-4" /> {t("addTable", lang)}
        </button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div
            key="add-form"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/80">
                <h3 className="font-bold text-[#1B2A4A] text-sm">{t("newTable", lang)}</h3>
                <button onClick={() => { setShowAdd(false); setNewLoc(""); }} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors touch-manipulation">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 flex gap-3 items-end">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t("location", lang)} <span className="text-slate-300 font-normal">{t("optional", lang)}</span></label>
                  <input
                    value={newLoc}
                    onChange={e => setNewLoc(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addMutation.mutate()}
                    placeholder={t("locPlaceholder", lang)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#1B2A4A] rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
                  />
                </div>
                <button
                  onClick={() => addMutation.mutate()}
                  disabled={addMutation.isPending}
                  className="flex items-center gap-2 bg-[#1B2A4A] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#243760] transition-colors disabled:opacity-40 touch-manipulation whitespace-nowrap"
                >
                  {addMutation.isPending ? t("adding", lang) : <><Check className="w-4 h-4" /> {t("add", lang)}</>}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {tables.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-14 text-center">
          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <Table2 className="w-7 h-7 text-slate-300" />
          </div>
          <p className="font-semibold text-slate-400 text-sm">{t("noTables", lang)}</p>
          <p className="text-slate-300 text-xs mt-1">{t("noTablesSub", lang)}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {tables.map(table => (
            <div key={table.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1B2A4A] rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-black text-sm">{table.number}</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{t("table", lang)} {table.number}</p>
                    <p className="text-slate-400 text-xs">{table.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full border", statusColor[table.status] || "bg-slate-100 text-slate-500 border-slate-200")}>
                    {statusLabel[table.status] || table.status}
                  </span>
                  <button
                    onClick={() => { if (confirm(t("confirmDelTable", lang))) deleteMutation.mutate(table.id); }}
                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors touch-manipulation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-4 flex items-center gap-4">
                {/* Hidden high-res canvas for download */}
                <div className="hidden">
                  <QRCodeCanvas
                    id={`table-qr-dl-${table.id}`}
                    value={getQrUrl(table.id)}
                    size={800}
                    bgColor="#ffffff"
                    fgColor="#0f172a"
                    level="H"
                    marginSize={2}
                  />
                </div>
                <div className="w-20 h-20 bg-white rounded-xl border border-slate-100 flex items-center justify-center flex-shrink-0 p-1.5">
                  <QRCodeCanvas
                    value={getQrUrl(table.id)}
                    size={68}
                    bgColor="#ffffff"
                    fgColor="#0f172a"
                    level="M"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <p className="text-xs text-slate-400 font-mono truncate">/masa/{table.id}</p>
                  <button
                    onClick={() => downloadQr(table.id, table.number)}
                    className="w-full flex items-center justify-center gap-2 bg-[#1B2A4A] hover:bg-[#243760] active:bg-[#243760] text-white text-xs font-semibold py-2.5 rounded-xl transition-colors touch-manipulation"
                  >
                    <Download className="w-3.5 h-3.5" />{t("downloadQr", lang)}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════ SETTINGS TAB ═══════════════════════ */
/* ── PinInput must live OUTSIDE SettingsTab so React never remounts it on keystrokes ── */
function PinInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="password"
      inputMode="numeric"
      value={value}
      onChange={e => onChange(e.target.value.replace(/\D/g, "").slice(0, 12))}
      placeholder={placeholder ?? "• • • •"}
      className="w-full bg-slate-50 border border-slate-200 focus:border-[#C1440E] rounded-xl px-4 py-2.5 text-sm outline-none transition-colors tracking-[0.3em] text-center font-bold"
    />
  );
}

function SettingsTab({ lang }: { lang: AdminLang }) {
  const queryClient = useQueryClient();
  const [adminForm, setAdminForm] = useState({ current: "", next: "", confirm: "" });
  const [waiterForm, setWaiterForm] = useState({ next: "", confirm: "" });
  const [adminMsg, setAdminMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [waiterMsg, setWaiterMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [adminSaving, setAdminSaving] = useState(false);
  const [waiterSaving, setWaiterSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoMsg, setLogoMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const { data: settingsData } = useQuery<{ logo: string | null; restaurantName: string }>({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/settings`, {
        headers: { "Authorization": `Bearer ${getToken()}` },
      });
      return res.json();
    },
    staleTime: 0,
  });

  const currentLogo = settingsData?.logo ?? null;

  async function uploadLogo(file: File) {
    setLogoMsg(null);
    setLogoUploading(true);
    try {
      const blob = await resizeImageToBlob(file, 1);
      const form = new FormData();
      form.append("image", blob, file.name);
      const res = await fetch(`${API_BASE}/upload/logo`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${getToken()}` },
        body: form,
      });
      if (!res.ok) throw new Error("failed");
      setLogoMsg({ ok: true, text: t("logoUpdated", lang) });
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["bundle"] });
    } catch {
      setLogoMsg({ ok: false, text: t("logoFailed", lang) });
    } finally {
      setLogoUploading(false);
    }
  }

  async function removeLogo() {
    setLogoMsg(null);
    setLogoUploading(true);
    try {
      await fetch(`${API_BASE}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getToken()}` },
        body: JSON.stringify({ logo: null }),
      });
      setLogoMsg({ ok: true, text: t("logoRemoved", lang) });
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["bundle"] });
    } catch {
      setLogoMsg({ ok: false, text: t("logoFailed", lang) });
    } finally {
      setLogoUploading(false);
    }
  }

  async function changeAdminPin(e: React.FormEvent) {
    e.preventDefault();
    setAdminMsg(null);
    if (adminForm.next.length < 4) { setAdminMsg({ ok: false, text: t("pinMinLen", lang) }); return; }
    if (adminForm.next !== adminForm.confirm) { setAdminMsg({ ok: false, text: t("pinMismatch", lang) }); return; }
    setAdminSaving(true);
    const res = await fetch(`${API_BASE}/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getToken()}` },
      body: JSON.stringify({ adminPin: adminForm.current, newAdminPin: adminForm.next }),
    });
    setAdminSaving(false);
    if (res.ok) {
      setAdminMsg({ ok: true, text: t("pinChanged", lang) });
      setAdminForm({ current: "", next: "", confirm: "" });
    } else {
      const err = await res.json().catch(() => ({}));
      setAdminMsg({ ok: false, text: (err as any).error === "Wrong current PIN" ? t("pinWrong", lang) : t("pinWrong", lang) });
    }
  }

  async function changeWaiterPin(e: React.FormEvent) {
    e.preventDefault();
    setWaiterMsg(null);
    if (waiterForm.next.length < 4) { setWaiterMsg({ ok: false, text: t("pinMinLen", lang) }); return; }
    if (waiterForm.next !== waiterForm.confirm) { setWaiterMsg({ ok: false, text: t("pinMismatch", lang) }); return; }
    setWaiterSaving(true);
    const res = await fetch(`${API_BASE}/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getToken()}` },
      body: JSON.stringify({ newWaiterPin: waiterForm.next }),
    });
    setWaiterSaving(false);
    if (res.ok) {
      setWaiterMsg({ ok: true, text: t("pinChanged", lang) });
      setWaiterForm({ next: "", confirm: "" });
    } else {
      setWaiterMsg({ ok: false, text: t("pinWrong", lang) });
    }
  }

  return (
    <div className="space-y-5 max-w-lg">

      {/* ── Logo Card ── */}
      <h2 className="font-bold text-[#1B2A4A] text-base sm:text-lg flex items-center gap-2">
        <ImageIcon className="w-5 h-5 text-[#C1440E]" />{t("logoSection", lang)}
      </h2>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-50 bg-slate-50/60 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-slate-400" />
          <h3 className="font-bold text-slate-700 text-sm">{t("logoSection", lang)}</h3>
          <span className="ml-auto text-xs text-slate-400">{t("logoDesc", lang)}</span>
        </div>
        <div className="p-5 flex items-center gap-5">
          {/* Preview */}
          <div className="w-24 h-24 flex-shrink-0 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
            {currentLogo ? (
              <img src={currentLogo} alt="logo" className="w-full h-full object-contain p-1" />
            ) : (
              <ImageIcon className="w-8 h-8 text-slate-300" />
            )}
          </div>

          {/* Actions */}
          <div className="flex-1 space-y-2.5">
            {!currentLogo && (
              <p className="text-xs text-slate-400 italic">{t("noLogo", lang)}</p>
            )}

            {/* Upload button */}
            <label className={cn(
              "w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold cursor-pointer transition-colors shadow-sm touch-manipulation",
              logoUploading
                ? "bg-slate-100 text-slate-400 pointer-events-none"
                : "bg-[#C1440E] hover:bg-[#a83a0c] text-white shadow-[#C1440E]/20"
            )}>
              {logoUploading
                ? <><Circle className="w-4 h-4 animate-spin" />{t("uploading", lang)}</>
                : <><Upload className="w-4 h-4" />{currentLogo ? t("changeLogo", lang) : t("uploadLogo", lang)}</>
              }
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={logoUploading}
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadLogo(f); e.target.value = ""; }}
              />
            </label>

            {/* Remove button */}
            {currentLogo && (
              <button
                onClick={removeLogo}
                disabled={logoUploading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40 touch-manipulation"
              >
                <X className="w-4 h-4" />{t("removeLogo", lang)}
              </button>
            )}

            {/* Status message */}
            <AnimatePresence>
              {logoMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs", logoMsg.ok ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-600 border border-red-100")}
                >
                  {logoMsg.ok ? <Check className="w-3.5 h-3.5 flex-shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />}
                  {logoMsg.text}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <h2 className="font-bold text-[#1B2A4A] text-base sm:text-lg flex items-center gap-2">
        <Shield className="w-5 h-5 text-[#C1440E]" />{t("pinSecurity", lang)}
      </h2>

      {/* Admin PIN card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-50 bg-slate-50/60 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-slate-400" />
          <h3 className="font-bold text-slate-700 text-sm">{t("adminPinLabel", lang)}</h3>
        </div>
        <form onSubmit={changeAdminPin} className="p-5 space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t("currentPin", lang)}</label>
            <PinInput value={adminForm.current} onChange={v => setAdminForm(f => ({ ...f, current: v }))} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t("newPin", lang)}</label>
            <PinInput value={adminForm.next} onChange={v => setAdminForm(f => ({ ...f, next: v }))} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t("confirmNewPin", lang)}</label>
            <PinInput value={adminForm.confirm} onChange={v => setAdminForm(f => ({ ...f, confirm: v }))} />
          </div>
          <AnimatePresence>
            {adminMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className={cn("flex items-center gap-2 px-4 py-3 rounded-xl text-sm", adminMsg.ok ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-600 border border-red-100")}
              >
                {adminMsg.ok ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                {adminMsg.text}
              </motion.div>
            )}
          </AnimatePresence>
          <button
            type="submit"
            disabled={adminSaving || !adminForm.current || !adminForm.next || !adminForm.confirm}
            className="w-full bg-[#C1440E] hover:bg-[#a83a0c] text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-40 flex items-center justify-center gap-2 shadow-sm shadow-[#C1440E]/20 touch-manipulation"
          >
            {adminSaving ? <><Circle className="w-4 h-4 animate-spin" />{t("changing", lang)}</> : <><Save className="w-4 h-4" />{t("changePin", lang)}</>}
          </button>
        </form>
      </div>

      {/* Waiter PIN card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-50 bg-slate-50/60 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-slate-400" />
          <h3 className="font-bold text-slate-700 text-sm">{t("waiterPinLabel", lang)}</h3>
        </div>
        <form onSubmit={changeWaiterPin} className="p-5 space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t("newPin", lang)}</label>
            <PinInput value={waiterForm.next} onChange={v => setWaiterForm(f => ({ ...f, next: v }))} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t("confirmNewPin", lang)}</label>
            <PinInput value={waiterForm.confirm} onChange={v => setWaiterForm(f => ({ ...f, confirm: v }))} />
          </div>
          <AnimatePresence>
            {waiterMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className={cn("flex items-center gap-2 px-4 py-3 rounded-xl text-sm", waiterMsg.ok ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-600 border border-red-100")}
              >
                {waiterMsg.ok ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                {waiterMsg.text}
              </motion.div>
            )}
          </AnimatePresence>
          <button
            type="submit"
            disabled={waiterSaving || !waiterForm.next || !waiterForm.confirm}
            className="w-full bg-[#1B2A4A] hover:bg-[#243760] text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-40 flex items-center justify-center gap-2 shadow-sm touch-manipulation"
          >
            {waiterSaving ? <><Circle className="w-4 h-4 animate-spin" />{t("changing", lang)}</> : <><Save className="w-4 h-4" />{t("changePin", lang)}</>}
          </button>
        </form>
      </div>
    </div>
  );
}

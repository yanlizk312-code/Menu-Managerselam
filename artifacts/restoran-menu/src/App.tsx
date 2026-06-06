import { lazy, Suspense, useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import MenuPage from "@/pages/menu";
import { ChefHat, Settings, QrCode, UtensilsCrossed } from "lucide-react";

const WaiterPage = lazy(() => import("@/pages/waiter"));
const AdminPage  = lazy(() => import("@/pages/admin"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, refetchOnReconnect: false, retry: 1 },
  },
});

function PageLoading() {
  return <div className="min-h-[100dvh] bg-[#F8F5F2]" />;
}

function StaffLanding() {
  const [, navigate] = useLocation();
  return (
    <div
      className="min-h-[100dvh] flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #F8F5F0 0%, #EDE8E2 100%)" }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full" style={{ background: "rgba(193,68,14,0.06)" }} />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full" style={{ background: "rgba(27,42,74,0.05)" }} />
      </div>

      <div className="relative w-full" style={{ maxWidth: "380px" }}>
        <div className="bg-white rounded-3xl overflow-hidden" style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.12)" }}>

          <div
            className="text-center"
            style={{ background: "#1B2A4A", padding: "36px 32px 28px" }}
          >
            <div
              className="flex items-center justify-center mx-auto"
              style={{
                width: 60, height: 60,
                background: "#C1440E",
                borderRadius: 16,
                marginBottom: 16,
              }}
            >
              <UtensilsCrossed style={{ width: 30, height: 30, color: "#fff" }} />
            </div>
            <h1
              style={{
                color: "#fff",
                fontSize: 22,
                fontFamily: "Georgia, serif",
                fontWeight: 700,
                letterSpacing: "0.12em",
                margin: 0,
              }}
            >AL-RISALA</h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, letterSpacing: "0.2em", marginTop: 6, marginBottom: 0 }}>
              Restaurant
            </p>
          </div>

          <div style={{ padding: "24px 24px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
            <button
              onClick={() => navigate("/garson")}
              style={{
                display: "flex", alignItems: "center", gap: 16,
                background: "#1a2035", color: "#fff",
                padding: "15px 18px", borderRadius: 16,
                border: "none", cursor: "pointer", width: "100%",
                textAlign: "left",
              }}
            >
              <div style={{
                width: 42, height: 42, background: "rgba(255,255,255,0.1)",
                borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <ChefHat style={{ width: 20, height: 20, color: "#fff" }} />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 15, margin: 0, color: "#fff" }}>Waiter Panel</p>
                <p style={{ fontSize: 12, margin: "3px 0 0", color: "rgba(255,255,255,0.45)" }}>
                  Track orders and table calls
                </p>
              </div>
            </button>

            <button
              onClick={() => navigate("/admin")}
              style={{
                display: "flex", alignItems: "center", gap: 16,
                background: "#f5f4f2", color: "#111",
                padding: "15px 18px", borderRadius: 16,
                border: "1px solid #e5e1db", cursor: "pointer", width: "100%",
                textAlign: "left",
              }}
            >
              <div style={{
                width: 42, height: 42, background: "#ebe8e4",
                borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <Settings style={{ width: 20, height: 20, color: "#555" }} />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 15, margin: 0, color: "#111" }}>Admin Panel</p>
                <p style={{ fontSize: 12, margin: "3px 0 0", color: "#999" }}>
                  Manage menu, tables and QR codes
                </p>
              </div>
            </button>
          </div>

          <div style={{ paddingBottom: 8 }} />
        </div>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Switch>
        <Route path="/" component={StaffLanding} />
        <Route path="/masa/:tableId" component={MenuPage} />
        <Route path="/garson" component={WaiterPage} />
        <Route path="/admin" component={AdminPage} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  useEffect(() => {
    const shell = document.getElementById("app-shell");
    if (shell) shell.remove();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

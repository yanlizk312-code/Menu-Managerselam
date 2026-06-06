import { useLocation } from "wouter";

export default function NotFound() {
  const [, navigate] = useLocation();
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-8 text-center bg-background">
      <h1 className="text-8xl font-serif font-bold text-primary mb-4">404</h1>
      <p className="text-xl text-foreground font-semibold mb-2">Sayfa Bulunamadı</p>
      <p className="text-muted-foreground text-sm mb-8">Aradığınız sayfa mevcut değil.</p>
      <button
        onClick={() => navigate("/")}
        className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity"
      >
        Ana Sayfaya Dön
      </button>
    </div>
  );
}

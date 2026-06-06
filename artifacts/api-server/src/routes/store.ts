import { INITIAL_CATEGORIES, INITIAL_MENU } from "./data/initial-data.js";

export interface LangMap { en: string; am: string; tr?: string; or?: string; }
export interface MenuItem { id: string; name: LangMap; description: LangMap; price: number; category: string; image: string; hidden: boolean; }
export interface Category { id: string; name: LangMap; order: number; }
export interface Table { id: string; number: number; location: string; status: string; activeOrderCount: number; }
export interface WaiterCall { tableId: string; count: number; lastCalledAt: number; }
export interface Settings { restaurantName: string; logo: string | null; adminPin: string; waiterPin: string; }

export const store = {
  menu: [...INITIAL_MENU] as MenuItem[],
  categories: [...INITIAL_CATEGORIES] as Category[],
  tables: [] as Table[],
  waiterCalls: new Map<string, WaiterCall>(),
  settings: {
    restaurantName: "AL-RISALA",
    logo: null,
    adminPin: "1234",
    waiterPin: "1234",
  } as Settings,
};

export function verifyToken(token: string): boolean {
  return token === "admin-token-alrisala";
}

export function authMiddleware(req: any, res: any, next: any) {
  const auth = req.headers["authorization"] as string | undefined;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = auth.slice(7);
  if (!verifyToken(token)) {
    return res.status(401).json({ error: "Invalid token" });
  }
  next();
}

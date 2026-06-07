import { supabase } from "./supabase.js";
import type { Table, MenuItem, Category } from "../routes/store.js";

// ─── Settings ────────────────────────────────────────────────────────────────

export async function dbGetSetting(key: string): Promise<string | null> {
  const { data } = await supabase.from("app_settings").select("value").eq("key", key).single();
  return data?.value ?? null;
}

export async function dbSetSetting(key: string, value: string | null): Promise<void> {
  await supabase.from("app_settings").upsert({ key, value }, { onConflict: "key" });
}

// ─── Tables ───────────────────────────────────────────────────────────────────

export async function dbLoadTables(): Promise<Table[]> {
  const { data, error } = await supabase
    .from("app_tables")
    .select("id, number, location, status, active_order_count")
    .order("number", { ascending: true });
  if (error || !data) return [];
  return data.map(r => ({
    id: r.id, number: r.number, location: r.location ?? "",
    status: r.status ?? "available", activeOrderCount: r.active_order_count ?? 0,
  }));
}

export async function dbSaveTable(table: Table): Promise<void> {
  await supabase.from("app_tables").upsert({
    id: table.id, number: table.number, location: table.location,
    status: table.status, active_order_count: table.activeOrderCount,
  }, { onConflict: "id" });
}

export async function dbDeleteTable(id: string): Promise<void> {
  await supabase.from("app_tables").delete().eq("id", id);
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function dbLoadCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name_en, name_am, sort_order")
    .order("sort_order", { ascending: true });
  if (error || !data) return [];
  return data.map(r => ({
    id: r.id,
    name: { en: r.name_en, am: r.name_am },
    order: r.sort_order,
  }));
}

export async function dbSaveCategory(cat: Category): Promise<void> {
  await supabase.from("categories").upsert({
    id: cat.id, name_en: cat.name.en, name_am: cat.name.am, sort_order: cat.order,
  }, { onConflict: "id" });
}

export async function dbDeleteCategory(id: string): Promise<void> {
  await supabase.from("categories").delete().eq("id", id);
}

export async function dbSeedCategories(cats: Category[]): Promise<void> {
  const rows = cats.map(c => ({ id: c.id, name_en: c.name.en, name_am: c.name.am, sort_order: c.order }));
  await supabase.from("categories").upsert(rows, { onConflict: "id", ignoreDuplicates: true });
}

// ─── Menu Items ───────────────────────────────────────────────────────────────

export async function dbLoadMenu(): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from("menu_items")
    .select("id, name_en, name_am, description_en, description_am, price, category, image, hidden, sort_order")
    .order("sort_order", { ascending: true });
  if (error || !data) return [];
  return data.map(r => ({
    id: r.id,
    name: { en: r.name_en, am: r.name_am },
    description: { en: r.description_en ?? "", am: r.description_am ?? "" },
    price: Number(r.price),
    category: r.category,
    image: r.image ?? "",
    hidden: r.hidden ?? false,
  }));
}

export async function dbSaveMenuItem(item: MenuItem, order?: number): Promise<void> {
  await supabase.from("menu_items").upsert({
    id: item.id,
    name_en: item.name.en, name_am: item.name.am,
    description_en: item.description.en, description_am: item.description.am,
    price: item.price, category: item.category,
    image: item.image, hidden: item.hidden,
    sort_order: order ?? 0,
  }, { onConflict: "id" });
}

export async function dbDeleteMenuItem(id: string): Promise<void> {
  await supabase.from("menu_items").delete().eq("id", id);
}

export async function dbSeedMenu(items: MenuItem[]): Promise<void> {
  const rows = items.map((item, i) => ({
    id: item.id,
    name_en: item.name.en, name_am: item.name.am,
    description_en: item.description.en, description_am: item.description.am,
    price: item.price, category: item.category,
    image: item.image, hidden: item.hidden, sort_order: i,
  }));
  await supabase.from("menu_items").upsert(rows, { onConflict: "id", ignoreDuplicates: true });
}

// ─── Storage Uploads ──────────────────────────────────────────────────────────

export async function uploadImageToSupabase(buffer: Buffer, ext: string, prefix: string): Promise<string> {
  const filename = `${prefix}-${Date.now()}${ext}`;
  const { error } = await supabase.storage.from("menu-images").upload(filename, buffer, {
    contentType: ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : ext === ".gif" ? "image/gif" : "image/jpeg",
    upsert: true,
  });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  const { data } = supabase.storage.from("menu-images").getPublicUrl(filename);
  return data.publicUrl;
}

export async function uploadLogoToSupabase(buffer: Buffer, ext: string): Promise<string> {
  const filename = `restaurant-logo${ext}`;
  const { error } = await supabase.storage.from("logos").upload(filename, buffer, {
    contentType: ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg",
    upsert: true,
    cacheControl: "600",
  });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  const { data } = supabase.storage.from("logos").getPublicUrl(filename);
  const publicUrl = data.publicUrl;
  await dbSetSetting("logo", publicUrl);
  return publicUrl;
}

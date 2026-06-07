import { supabase } from "./supabase.js";
import type { Table, MenuItem, Category } from "../routes/store.js";

// ─── Settings ────────────────────────────────────────────────────────────────

export async function dbGetSetting(key: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", key)
    .single();
  if (error) return null;
  return data?.value ?? null;
}

export async function dbSetSetting(key: string, value: string | null): Promise<void> {
  await supabase
    .from("app_settings")
    .upsert({ key, value }, { onConflict: "key" });
}

// ─── Tables ───────────────────────────────────────────────────────────────────

export async function dbLoadTables(): Promise<Table[]> {
  const { data, error } = await supabase
    .from("app_tables")
    .select("*")
    .order("number", { ascending: true });
  if (error || !data) return [];
  return data.map(r => ({
    id: r.id,
    number: r.number,
    location: r.location ?? "",
    status: r.status ?? "available",
    activeOrderCount: r.active_order_count ?? 0,
  }));
}

export async function dbSaveTable(table: Table): Promise<void> {
  await supabase.from("app_tables").upsert({
    id: table.id,
    number: table.number,
    location: table.location,
    status: table.status,
    active_order_count: table.activeOrderCount,
  }, { onConflict: "id" });
}

export async function dbDeleteTable(id: string): Promise<void> {
  await supabase.from("app_tables").delete().eq("id", id);
}

// ─── Logo Upload via Supabase Storage ────────────────────────────────────────

export async function uploadLogoToSupabase(
  buffer: Buffer,
  ext: string
): Promise<string> {
  const filename = `restaurant-logo${ext}`;
  const { error } = await supabase.storage
    .from("logos")
    .upload(filename, buffer, {
      contentType: ext === ".png" ? "image/png" : "image/jpeg",
      upsert: true,
    });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabase.storage.from("logos").getPublicUrl(filename);
  const publicUrl = `${data.publicUrl}?v=${Date.now()}`;
  await dbSetSetting("logo", publicUrl);
  return publicUrl;
}

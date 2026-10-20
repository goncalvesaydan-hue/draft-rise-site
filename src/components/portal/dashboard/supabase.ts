import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppDatabase } from './types';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(url: string, key: string): SupabaseClient | null {
  if (!url || !key) return null;
  try {
    if (!supabaseInstance) {
      supabaseInstance = createClient(url, key, {
        auth: { persistSession: false }
      });
    }
    return supabaseInstance;
  } catch (err) {
    console.error('Falha ao inicializar Supabase:', err);
    return null;
  }
}

export function resetSupabaseClient() {
  supabaseInstance = null;
}

export async function testSupabaseConnection(url: string, key: string): Promise<boolean> {
  try {
    const client = createClient(url, key, { auth: { persistSession: false } });
    const { error } = await client.from('gbp_rooms').select('room').limit(1);
    if (error && error.code !== 'PGRST116') {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function pushDatabaseToCloud(db: AppDatabase): Promise<{ ok: boolean; error?: string }> {
  if (!db.sync.enabled || !db.sync.url || !db.sync.key) {
    return { ok: false, error: 'Sincronização desativada ou incompleta.' };
  }

  try {
    const client = getSupabase(db.sync.url, db.sync.key);
    if (!client) return { ok: false, error: 'Cliente Supabase indisponível.' };

    const { error } = await client.from('gbp_rooms').upsert(
      {
        room: db.sync.room || 'gbp-team-default',
        password: db.sync.password,
        data: db,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'room' }
    );

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro de conexão.';
    return { ok: false, error: message };
  }
}

export async function pullDatabaseFromCloud(db: AppDatabase): Promise<{ ok: boolean; data?: AppDatabase; error?: string }> {
  if (!db.sync.enabled || !db.sync.url || !db.sync.key) {
    return { ok: false, error: 'Sincronização desativada.' };
  }

  try {
    const client = getSupabase(db.sync.url, db.sync.key);
    if (!client) return { ok: false, error: 'Cliente Supabase indisponível.' };

    const { data, error } = await client
      .from('gbp_rooms')
      .select('*')
      .eq('room', db.sync.room || 'gbp-team-default')
      .maybeSingle();

    if (error) {
      return { ok: false, error: error.message };
    }

    if (!data) {
      return { ok: true }; // Sala vazia ainda
    }

    if (data.password && data.password !== db.sync.password) {
      return { ok: false, error: 'Senha da sala incorreta.' };
    }

    const remoteDb = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
    return { ok: true, data: remoteDb };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro de rede ao sincronizar.';
    return { ok: false, error: message };
  }
}


import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const SNAPSHOT_DIR = path.join(process.cwd(), 'scratch', 'snapshots');

function ensureSnapshotDir() {
  if (!fs.existsSync(SNAPSHOT_DIR)) {
    try {
      fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
    } catch {}
  }
}

export interface CatalogSnapshot {
  snapshotId: string;
  createdAt: string;
  totalProducts: number;
  products: any[];
  reason: string;
}

/**
 * Creates an atomic snapshot of products before any high-risk bulk operation
 */
export async function createPreOperationSnapshot(reason: string): Promise<string | null> {
  try {
    ensureSnapshotDir();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseKey) return null;

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: products, error } = await supabase.from('products').select('*');

    if (error || !products) {
      console.error('Failed to create snapshot:', error);
      return null;
    }

    const snapshotId = `snap_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const snapshot: CatalogSnapshot = {
      snapshotId,
      createdAt: new Date().toISOString(),
      totalProducts: products.length,
      products,
      reason,
    };

    const filePath = path.join(SNAPSHOT_DIR, `${snapshotId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2), 'utf8');
    console.log(`[RECOVERY] Pre-operation snapshot created: ${snapshotId} (${products.length} products)`);
    return snapshotId;
  } catch (err) {
    console.error('Error creating snapshot:', err);
    return null;
  }
}

/**
 * Restores products from a previous snapshot
 */
export async function rollbackToSnapshot(snapshotId: string): Promise<{ success: boolean; restored: number; error?: string }> {
  try {
    const filePath = path.join(SNAPSHOT_DIR, `${snapshotId}.json`);
    if (!fs.existsSync(filePath)) {
      return { success: false, restored: 0, error: 'Snapshot file not found' };
    }

    const raw = fs.readFileSync(filePath, 'utf8');
    const snapshot: CatalogSnapshot = JSON.parse(raw);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Upsert in batches of 50
    let restored = 0;
    const batchSize = 50;
    for (let i = 0; i < snapshot.products.length; i += batchSize) {
      const chunk = snapshot.products.slice(i, i + batchSize);
      const { data, error } = await supabase.from('products').upsert(chunk, { onConflict: 'id' }).select('id');
      if (error) throw error;
      restored += data?.length || 0;
    }

    return { success: true, restored };
  } catch (err: any) {
    return { success: false, restored: 0, error: err.message };
  }
}

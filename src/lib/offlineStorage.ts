import { get, set, update } from 'idb-keyval';
import type { SavedItinerary, ChecklistItem } from '@/types/travel';

const TRIPS_STORE_KEY = 'travelmatene_offline_trips';
const CHECKLISTS_STORE_KEY = 'travelmatene_offline_checklists';
const SYNC_META_KEY = 'travelmatene_sync_meta';

export interface OfflineChecklistRecord {
  id: string;
  tripLabel: string;
  permitType: string;
  items: ChecklistItem[];
  updatedAt: string;
}

export interface OfflineSyncStatus {
  pendingSyncCount: number;
  lastSyncedAt: string | null;
}

/**
 * Safely guards against SSR execution (IndexedDB is browser-only).
 */
function isClient(): boolean {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
}

/**
 * Saves or updates a travel itinerary to local IndexedDB for offline pocket usage.
 */
export async function saveOfflineTrip(itinerary: SavedItinerary): Promise<void> {
  if (!isClient()) return;

  try {
    const existing = (await get<SavedItinerary[]>(TRIPS_STORE_KEY)) || [];
    const filtered = existing.filter((item) => item.id !== itinerary.id);
    const updated = [itinerary, ...filtered];

    await set(TRIPS_STORE_KEY, updated);

    // Track pending sync count
    await update<OfflineSyncStatus>(SYNC_META_KEY, (val) => ({
      pendingSyncCount: (val?.pendingSyncCount || 0) + 1,
      lastSyncedAt: val?.lastSyncedAt || new Date().toISOString(),
    }));
  } catch (err) {
    console.error('[OfflineStorage] Error saving offline trip:', err);
    throw err;
  }
}

/**
 * Retrieves all locally cached offline itineraries from IndexedDB.
 */
export async function getOfflineTrips(): Promise<SavedItinerary[]> {
  if (!isClient()) return [];

  try {
    const trips = await get<SavedItinerary[]>(TRIPS_STORE_KEY);
    return trips || [];
  } catch (err) {
    console.warn('[OfflineStorage] Error loading offline trips:', err);
    return [];
  }
}

/**
 * Deletes a saved offline trip by ID from local IndexedDB.
 */
export async function deleteOfflineTrip(id: string): Promise<void> {
  if (!isClient()) return;

  try {
    const existing = (await get<SavedItinerary[]>(TRIPS_STORE_KEY)) || [];
    const updated = existing.filter((item) => item.id !== id);
    await set(TRIPS_STORE_KEY, updated);
  } catch (err) {
    console.error('[OfflineStorage] Error deleting offline trip:', err);
    throw err;
  }
}

/**
 * Saves or updates a document checklist to local IndexedDB.
 */
export async function saveOfflineChecklist(checklist: {
  id: string;
  tripLabel: string;
  permitType: string;
  items: ChecklistItem[];
  updatedAt?: string;
}): Promise<void> {
  if (!isClient()) return;

  try {
    const record: OfflineChecklistRecord = {
      id: checklist.id,
      tripLabel: checklist.tripLabel,
      permitType: checklist.permitType,
      items: checklist.items,
      updatedAt: checklist.updatedAt || new Date().toISOString(),
    };

    const existing = (await get<OfflineChecklistRecord[]>(CHECKLISTS_STORE_KEY)) || [];
    const filtered = existing.filter((item) => item.id !== record.id);
    const updated = [record, ...filtered];

    await set(CHECKLISTS_STORE_KEY, updated);

    await update<OfflineSyncStatus>(SYNC_META_KEY, (val) => ({
      pendingSyncCount: (val?.pendingSyncCount || 0) + 1,
      lastSyncedAt: val?.lastSyncedAt || new Date().toISOString(),
    }));
  } catch (err) {
    console.error('[OfflineStorage] Error saving offline checklist:', err);
    throw err;
  }
}

/**
 * Retrieves all offline document checklists stored locally.
 */
export async function getOfflineChecklists(): Promise<OfflineChecklistRecord[]> {
  if (!isClient()) return [];

  try {
    const checklists = await get<OfflineChecklistRecord[]>(CHECKLISTS_STORE_KEY);
    return checklists || [];
  } catch (err) {
    console.warn('[OfflineStorage] Error loading offline checklists:', err);
    return [];
  }
}

/**
 * Returns current sync status and count of locally modified records pending upstream sync.
 */
export async function getOfflineSyncStatus(): Promise<OfflineSyncStatus> {
  if (!isClient()) {
    return { pendingSyncCount: 0, lastSyncedAt: null };
  }

  try {
    const status = await get<OfflineSyncStatus>(SYNC_META_KEY);
    return {
      pendingSyncCount: status?.pendingSyncCount || 0,
      lastSyncedAt: status?.lastSyncedAt || null,
    };
  } catch (err) {
    return { pendingSyncCount: 0, lastSyncedAt: null };
  }
}

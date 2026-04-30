// Tiny IndexedDB wrapper for persisting generated stories on-device.
// Chosen over localStorage because the cover images can be ~2 MB
// base64 data URIs and would blow past localStorage's 5 MB cap fast.

export type SavedStory = {
  id: string;
  title: string;
  paragraphs: string[];
  imagePrompt: string;
  imageUrl: string | null;
  storyPrompt: string;
  createdAt: number;
};

const DB_NAME = "kids-story-library";
const DB_VERSION = 1;
const STORE = "stories";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("IndexedDB only available in the browser"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const os = db.createObjectStore(STORE, { keyPath: "id" });
        os.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx(db: IDBDatabase, mode: IDBTransactionMode) {
  return db.transaction(STORE, mode).objectStore(STORE);
}

export async function saveStory(story: SavedStory): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const req = tx(db, "readwrite").put(story);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
  db.close();
}

export async function updateStory(
  id: string,
  patch: Partial<SavedStory>,
): Promise<void> {
  const existing = await getStory(id);
  if (!existing) return;
  await saveStory({ ...existing, ...patch });
}

export async function getStory(id: string): Promise<SavedStory | null> {
  const db = await openDb();
  const result = await new Promise<SavedStory | null>((resolve, reject) => {
    const req = tx(db, "readonly").get(id);
    req.onsuccess = () => resolve((req.result as SavedStory | undefined) ?? null);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return result;
}

export async function listStories(): Promise<SavedStory[]> {
  const db = await openDb();
  const all = await new Promise<SavedStory[]>((resolve, reject) => {
    const req = tx(db, "readonly").getAll();
    req.onsuccess = () => resolve((req.result as SavedStory[]) ?? []);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteStory(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const req = tx(db, "readwrite").delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
  db.close();
}

export function newStoryId(): string {
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

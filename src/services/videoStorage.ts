/**
 * videoStorage.ts
 * Reliable local storage for video and audio recordings using the browser IndexedDB API.
 * 
 * Why this exists:
 * LocalStorage has a strict ~5MB quota that causes DOMException when saving Base64 video files.
 * IndexedDB provides gigabytes of structured local client storage, allowing high-resolution
 * webcam video rehearsals and speech audio to be saved and replayed seamlessly offline.
 */

const DB_NAME = 'MaksudulPersonalDevDB';
const DB_VERSION = 1;
const STORE_NAME = 'media_recordings';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser environment.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB.'));
  });
}

/**
 * Saves a video or audio Blob directly to IndexedDB.
 */
export async function saveMediaBlob(id: string, blob: Blob, mimeType: string = 'video/webm'): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const record = {
      id,
      blob,
      mimeType,
      savedAt: new Date().toISOString()
    };

    const request = store.put(record);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error || new Error(`Failed to save media blob ${id}`));
  });
}

/**
 * Retrieves a stored video/audio Blob from IndexedDB.
 */
export async function getMediaBlob(id: string): Promise<Blob | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);

      const request = store.get(id);
      request.onsuccess = () => {
        if (request.result && request.result.blob instanceof Blob) {
          resolve(request.result.blob);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error || new Error(`Failed to get media blob ${id}`));
    });
  } catch (error) {
    console.warn('IndexedDB read error for id:', id, error);
    return null;
  }
}

/**
 * Deletes a stored recording from IndexedDB.
 */
export async function deleteMediaBlob(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error || new Error(`Failed to delete media blob ${id}`));
    });
  } catch (error) {
    console.warn('IndexedDB delete error for id:', id, error);
  }
}

/**
 * Generates an active playback URL for a stored recording ID.
 */
export async function getMediaPlaybackUrl(id: string): Promise<string | null> {
  const blob = await getMediaBlob(id);
  if (!blob) return null;
  return URL.createObjectURL(blob);
}

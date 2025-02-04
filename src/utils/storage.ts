import browser from 'webextension-polyfill';

export const storage = {
    get: async <T>(key: string): Promise<T | undefined> => {
      const result = await browser.storage.local.get(key);
      return result[key] as T | undefined; // Explicitly cast the return value
    },
    set: async <T>(key: string, value: T): Promise<void> => {
      await browser.storage.local.set({ [key]: value });
    },
    remove: async (key: string): Promise<void> => {
      await browser.storage.local.remove(key);
    },
  };
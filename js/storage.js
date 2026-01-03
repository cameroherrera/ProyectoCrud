const STORAGE_KEY = "pensionados_imss_v1";

const Storage = {
  getAll() {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    try {
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveAll(items) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  },

  clear() {
    window.localStorage.removeItem(STORAGE_KEY);
  }
};

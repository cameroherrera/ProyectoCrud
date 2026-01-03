class PensionadoService {
  constructor() {
    this.items = Storage.getAll();
  }

  _persist() {
    Storage.saveAll(this.items);
  }

  list() {
    return [...this.items];
  }

  create(data) {
    const item = {
      id: crypto.randomUUID(),
      ...data,
      createdAt: Date.now()
    };
    this.items.unshift(item);
    this._persist();
    return item;
  }

  update(id, patch) {
    const idx = this.items.findIndex(x => x.id === id);
    if (idx === -1) return null;

    this.items[idx] = { ...this.items[idx], ...patch };
    this._persist();
    return this.items[idx];
  }

  remove(id) {
    const before = this.items.length;
    this.items = this.items.filter(x => x.id !== id);
    this._persist();
    return this.items.length !== before;
  }

  removeAll() {
    this.items = [];
    Storage.clear();
  }

  getById(id) {
    return this.items.find(x => x.id === id) || null;
  }

  existsByCurpOrNss(curp, nss, excludeId = null) {
    const c = (curp || "").toUpperCase();
    const n = (nss || "").trim();
    return this.items.some(x => {
      if (excludeId && x.id === excludeId) return false;
      return x.curp === c || x.nss === n;
    });
  }
}

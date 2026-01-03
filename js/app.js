(() => {
  const service = new PensionadoService();

  // Validaciones prácticas (no “perfectas”, pero robustas para clase)
  const CURP_REGEX = /^[A-Z][AEIOUX][A-Z]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HM][A-Z]{2}[B-DF-HJ-NP-TV-Z]{3}[A-Z0-9]\d$/i;
  const NSS_REGEX = /^\d{11}$/;

  function normalizePhone(raw) {
    // Deja solo dígitos (útil para MX)
    return (raw || "").replace(/\D/g, "");
  }

  function calcAge(yyyyMMdd) {
    if (!yyyyMMdd) return null;
    const [y, m, d] = yyyyMMdd.split("-").map(Number);
    if (!y || !m || !d) return null;

    const today = new Date();
    const birth = new Date(y, m - 1, d);
    if (Number.isNaN(birth.getTime())) return null;

    let age = today.getFullYear() - birth.getFullYear();
    const hasHadBirthday =
      (today.getMonth() > birth.getMonth()) ||
      (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());

    if (!hasHadBirthday) age -= 1;
    return age;
  }

  function applySearch() {
    const q = UI.getSearchQuery();
    let items = service.list();

    if (q) {
      items = items.filter(p =>
        p.nombre.toLowerCase().includes(q) ||
        p.curp.toLowerCase().includes(q) ||
        p.nss.includes(q) ||
        p.estado.toLowerCase().includes(q)
      );
    }

    UI.render(items);
  }

  UI.bindEvents({
    onBirthDateChange(value) {
      const age = calcAge(value);
      UI.setAge(age ?? "");
    },

    onSubmit(data) {
      // Normalización
      data.telefono = normalizePhone(data.telefono);
      data.edad = calcAge(data.fechaNacimiento) ?? 0;

      // Reglas mínimas
      if (data.nombre.length < 3) {
        alert("El nombre debe tener al menos 3 caracteres.");
        return;
      }
      if (!CURP_REGEX.test(data.curp)) {
        alert("CURP inválida. Verifica que tenga 18 caracteres y formato correcto.");
        return;
      }
      if (!NSS_REGEX.test(data.nss)) {
        alert("NSS inválido. Debe tener exactamente 11 dígitos.");
        return;
      }
      if (data.telefono.length < 10) {
        alert("Teléfono inválido. Usa al menos 10 dígitos.");
        return;
      }
      if (!data.fechaNacimiento) {
        alert("Selecciona fecha de nacimiento.");
        return;
      }
      if (!data.estado) {
        alert("El campo Estado es obligatorio.");
        return;
      }

      // Evitar duplicados por CURP o NSS
      if (service.existsByCurpOrNss(data.curp, data.nss, data.id || null)) {
        alert("Ya existe un registro con esa CURP o ese NSS.");
        return;
      }

      if (!data.id) {
        service.create(data);
        UI.setModeCreate();
      } else {
        service.update(data.id, data);
        UI.setModeCreate();
      }

      applySearch();
    },

    onEdit(id) {
      const item = service.getById(id);
      if (!item) return;
      UI.setModeEdit(item);
      window.location.hash = "#crear";
    },

    onDelete(id) {
      const item = service.getById(id);
      if (!item) return;

      const ok = confirm(`¿Borrar el registro de "${item.nombre}"?`);
      if (!ok) return;

      service.remove(id);
      UI.setModeCreate();
      applySearch();
    },

    onCancelEdit() {
      UI.setModeCreate();
    },

    onSearchChange() {
      applySearch();
    },

    onClearAll() {
      const ok = confirm("¿Seguro que deseas borrar TODOS los registros? Esta acción no se puede deshacer.");
      if (!ok) return;

      service.removeAll();
      UI.setModeCreate();
      applySearch();
    }
  });

  // Init
  UI.setModeCreate();
  applySearch();
})();

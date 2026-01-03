console.log("ui.js cargo");

const UI = (() => {
  const el = {
    formTitle: document.getElementById("formTitle"),
    form: document.getElementById("pensionadoForm"),
    id: document.getElementById("pensionadoId"),
    nombre: document.getElementById("nombre"),
    curp: document.getElementById("curp"),
    nss: document.getElementById("nss"),
    telefono: document.getElementById("telefono"),
    fechaNacimiento: document.getElementById("fechaNacimiento"),
    edad: document.getElementById("edad"),
    estado: document.getElementById("estado"),

    submitBtn: document.getElementById("submitBtn"),
    cancelEditBtn: document.getElementById("cancelEditBtn"),
    formHint: document.getElementById("formHint"),

    search: document.getElementById("search"),
    countLabel: document.getElementById("countLabel"),
    clearAllBtn: document.getElementById("clearAllBtn"),

    list: document.getElementById("pensionadoList"),
    emptyState: document.getElementById("emptyState"),
    year: document.getElementById("year")
  };

  const escapeHtml = (str) =>
    String(str || "").replace(/[&<>"']/g, (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[m]));

  const fmtDate = (yyyyMMdd) => {
    if (!yyyyMMdd) return "";
    const [y, m, d] = yyyyMMdd.split("-");
    return `${d}/${m}/${y}`;
  };

  function setModeCreate() {
    el.formTitle.textContent = "Registrar pensionado";
    el.submitBtn.textContent = "Guardar";
    el.cancelEditBtn.hidden = true;
    el.id.value = "";
    el.formHint.textContent = "";
    el.form.reset();
    el.edad.value = "";
    el.nombre.focus();
  }

  function setModeEdit(item) {
    el.formTitle.textContent = "Editar pensionado";
    el.submitBtn.textContent = "Actualizar";
    el.cancelEditBtn.hidden = false;

    el.id.value = item.id;
    el.nombre.value = item.nombre;
    el.curp.value = item.curp;
    el.nss.value = item.nss;
    el.telefono.value = item.telefono;
    el.fechaNacimiento.value = item.fechaNacimiento;
    el.edad.value = item.edad;
    el.estado.value = item.estado;

    el.formHint.textContent = `Editando: ${item.nombre}`;
    el.nombre.focus();
  }

  function render(items) {
    el.list.innerHTML = "";

    el.countLabel.textContent = `${items.length} registro${items.length === 1 ? "" : "s"}`;
    el.emptyState.hidden = items.length !== 0;

    for (const p of items) {
      const li = document.createElement("li");
      li.className = "item";
      li.dataset.id = p.id;

      li.innerHTML = `
        <div class="item__top">
          <div>
            <h3 class="item__title">${escapeHtml(p.nombre)}</h3>
            <p class="item__desc">
              <strong>CURP:</strong> ${escapeHtml(p.curp)} &nbsp; | &nbsp;
              <strong>NSS:</strong> ${escapeHtml(p.nss)}
            </p>
          </div>
          <span class="badge">${escapeHtml(p.estado)}</span>
        </div>

        <p class="item__desc">
          <strong>Tel:</strong> ${escapeHtml(p.telefono)} &nbsp; | &nbsp;
          <strong>Nac:</strong> ${escapeHtml(fmtDate(p.fechaNacimiento))} &nbsp; | &nbsp;
          <strong>Edad:</strong> ${escapeHtml(p.edad)}
        </p>

        <div class="item__bottom">
          <span class="item__date">Registrado: ${new Date(p.createdAt).toLocaleString("es-MX")}</span>
          <div class="actions">
            <button class="btn" data-action="edit">Editar</button>
            <button class="btn btn--danger" data-action="delete">Borrar</button>
          </div>
        </div>
      `;

      el.list.appendChild(li);
    }
  }

  function getFormData() {
    return {
      id: el.id.value || null,
      nombre: el.nombre.value.trim(),
      curp: el.curp.value.trim().toUpperCase(),
      nss: el.nss.value.trim(),
      telefono: el.telefono.value.trim(),
      fechaNacimiento: el.fechaNacimiento.value,
      edad: Number(el.edad.value || 0),
      estado: el.estado.value.trim()
    };
  }

  function bindEvents(handlers) {
    if (el.year) el.year.textContent = String(new Date().getFullYear());

    console.log("form:", el.form);
    console.log("list:", el.list);
    console.log("search:", el.search);
    console.log("clearAllBtn:", el.clearAllBtn);
    console.log("cancelEditBtn:", el.cancelEditBtn);


    el.form.addEventListener("submit", (e) => {
      e.preventDefault();
      handlers.onSubmit(getFormData());
    });

    el.cancelEditBtn.addEventListener("click", () => handlers.onCancelEdit());

    el.list.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;

      const li = e.target.closest("li.item");
      if (!li) return;

      const id = li.dataset.id;
      const action = btn.dataset.action;

      if (action === "edit") handlers.onEdit(id);
      if (action === "delete") handlers.onDelete(id);
    });

    el.search.addEventListener("input", () => handlers.onSearchChange());

    el.clearAllBtn.addEventListener("click", () => handlers.onClearAll());

    // Calcular edad al cambiar fecha
    el.fechaNacimiento.addEventListener("change", () => handlers.onBirthDateChange(el.fechaNacimiento.value));
  }

  function setAge(age) {
    el.edad.value = Number.isFinite(age) ? String(age) : "";
  }

  function getSearchQuery() {
    return el.search.value.trim().toLowerCase();
  }

  return {
    render,
    bindEvents,
    setModeCreate,
    setModeEdit,
    getFormData,
    setAge,
    getSearchQuery
  };
})();

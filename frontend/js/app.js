let patrullas = [];
let actividades = [];
let currentMode = null;
const $ = id => document.getElementById(id);

function hoyISO() { return new Date().toISOString().slice(0, 10); }
function escapeHtml(str) {
    if (!str) return "";
    return String(str).replace(/[&<>\"]/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
}
function actualizarFecha() {
    $("currentDate").innerHTML = `📅 ${new Date().toLocaleDateString("es-ES", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}`;
}
function setModo(modo) {
    currentMode = modo;
    $("modeBadge").innerHTML = modo === "leader" ? "👑 MODO DIRIGENTE" : "🔍 MODO SCOUT";
    $("editHint").innerHTML = modo === "leader" ? "✏️ EDITABLE" : "🔍 SOLO LECTURA";
    document.querySelectorAll("#addActivityBtn,#saveMeetingBtn,#resetMeetingBtn,#crearPatrullaBtn").forEach(btn => btn.disabled = modo !== "leader");
    $("patrullaForm").style.display = modo === "leader" ? "flex" : "none";
}
async function login() {
    try {
        const data = await apiRequest("/auth/login", {
            method: "POST",
            body: JSON.stringify({ usuario: $("usuarioLogin").value.trim(), password: $("passwordLogin").value })
        });
        setToken(data.token);
        abrirApp("leader");
    } catch (error) { $("authError").innerText = error.message; }
}
async function abrirApp(modo) {
    $("authModal").style.display = "none";
    $("appContainer").style.display = "block";
    setModo(modo);
    await cargarTodo();
}
function salir() {
    clearToken(); currentMode = null;
    $("appContainer").style.display = "none";
    $("authModal").style.display = "flex";
    $("passwordLogin").value = ""; $("authError").innerText = "";
}
async function cargarTodo() {
    await cargarPatrullas();
    iniciarReunionSiVacia();
    renderActividades(); renderRanking(); renderPatrullas(); await cargarHistorial();
}
async function cargarPatrullas() { patrullas = await apiRequest("/patrullas"); }
function iniciarReunionSiVacia() {
    $("fechaReunion").value = hoyISO();
    if (actividades.length === 0) actividades = [nuevaActividad("Actividad 1"), nuevaActividad("Actividad 2"), nuevaActividad("Actividad 3"), nuevaActividad("Actividad 4")];
}
function nuevaActividad(nombre) {
    return { id: crypto.randomUUID(), nombre, resultados: patrullas.map(p => ({ patrullaId: p._id, nombrePatrulla: p.nombre, color: p.color, puntaje: 0 })) };
}
function sincronizarPatrullasEnActividades() {
    actividades.forEach(act => {
        patrullas.forEach(p => {
            if (!act.resultados.some(r => r.patrullaId === p._id)) act.resultados.push({ patrullaId: p._id, nombrePatrulla: p.nombre, color: p.color, puntaje: 0 });
        });
        act.resultados = act.resultados.filter(r => patrullas.some(p => p._id === r.patrullaId));
    });
}
function renderActividades() {
    sincronizarPatrullasEnActividades();
    const container = $("activitiesContainer"); container.innerHTML = "";
    const editable = currentMode === "leader";
    actividades.forEach((act, index) => {
        const div = document.createElement("div"); div.className = "activity-item";
        div.innerHTML = `<div class="activity-header"><div class="activity-number">${index + 1}</div>${editable ? `<input class="input activity-name" data-id="${act.id}" value="${escapeHtml(act.nombre)}">` : `<div style="flex:1">${escapeHtml(act.nombre)}</div>`}${editable ? `<button class="btn-danger delete-activity" data-id="${act.id}">🗑️</button>` : ""}</div><div class="patrols-grid">${act.resultados.map(r => `<div class="patrol-card"><div class="patrol-name" style="color:${r.color}">${escapeHtml(r.nombrePatrulla)}</div>${editable ? `<input type="number" class="score-input" data-act="${act.id}" data-pat="${r.patrullaId}" value="${r.puntaje}" min="0" max="999">` : `<div class="total-score">${r.puntaje}</div>`}</div>`).join("")}</div>`;
        container.appendChild(div);
    });
    if (!editable) return;
    document.querySelectorAll(".score-input").forEach(input => {
        input.oninput = () => {
            const act = actividades.find(a => a.id === input.dataset.act);
            const resultado = act.resultados.find(r => r.patrullaId === input.dataset.pat);
            resultado.puntaje = Math.max(0, Number(input.value || 0)); renderRanking();
        };
    });
    document.querySelectorAll(".activity-name").forEach(input => { input.onchange = () => { const act = actividades.find(a => a.id === input.dataset.id); act.nombre = input.value.trim() || "Actividad"; }; });
    document.querySelectorAll(".delete-activity").forEach(btn => { btn.onclick = () => { if (actividades.length <= 1) { alert("Debe existir al menos una actividad."); return; } actividades = actividades.filter(a => a.id !== btn.dataset.id); renderActividades(); renderRanking(); }; });
}
function getRanking() {
    const map = {};
    actividades.forEach(act => act.resultados.forEach(r => {
        if (!map[r.patrullaId]) map[r.patrullaId] = { patrullaId: r.patrullaId, nombrePatrulla: r.nombrePatrulla, color: r.color, puntaje: 0 };
        map[r.patrullaId].puntaje += Number(r.puntaje || 0);
    }));
    return Object.values(map).sort((a, b) => b.puntaje - a.puntaje);
}
function renderRanking() {
    const ranking = getRanking(); const body = $("rankingBody"); body.innerHTML = "";
    ranking.forEach((p, i) => body.innerHTML += `<tr><td><strong>${i + 1}</strong></td><td><strong style="color:${p.color}">${escapeHtml(p.nombrePatrulla)}</strong></td><td><span class="total-score">${p.puntaje}</span></td></tr>`);
    const winners = ranking.filter(x => x.puntaje > 0 && x.puntaje === (ranking[0]?.puntaje || 0));
    const div = $("winnerAnnouncement");
    if (!winners.length) { div.style.display = "none"; return; }
    div.style.display = "block";
    div.innerHTML = winners.length === 1 ? `🏆 PATRULLA GANADORA: ${winners[0].nombrePatrulla} - ${winners[0].puntaje} pts` : `🏆 EMPATE: ${winners.map(w => w.nombrePatrulla).join(", ")} - ${winners[0].puntaje} pts`;
}
async function guardarReunion() {
    try {
        const ranking = getRanking();
        if (!ranking.some(r => r.puntaje > 0)) { alert("No hay puntajes para guardar."); return; }
        const reunion = { nombre: $("nombreReunion").value.trim() || "Reunión ordinaria", fecha: $("fechaReunion").value, actividades: actividades.map(a => ({ nombre: a.nombre, resultados: a.resultados })), observaciones: $("observaciones").value.trim() };
        await apiRequest("/reuniones", { method: "POST", body: JSON.stringify(reunion) });
        alert("✅ Reunión guardada correctamente."); reiniciarReunion(); await cargarHistorial();
    } catch (error) { alert(error.message); }
}
function reiniciarReunion() {
    actividades = []; $("nombreReunion").value = "Reunión ordinaria"; $("fechaReunion").value = hoyISO(); $("observaciones").value = "";
    iniciarReunionSiVacia(); renderActividades(); renderRanking();
}
async function cargarHistorial() {
    const reuniones = await apiRequest("/reuniones"); const div = $("historialList");
    if (!reuniones.length) { div.innerHTML = `<p style="text-align:center;color:#8ba888;">📭 Sin reuniones guardadas</p>`; return; }
    div.innerHTML = reuniones.map(r => `<div class="history-item"><div class="history-date-header"><span>📅 ${new Date(r.fecha).toLocaleDateString("es-ES")}</span><span>🏆 ${escapeHtml(r.ganador || "Sin ganador")}</span></div><div class="history-detail">${(r.rankingFinal || []).map(p => `${p.nombrePatrulla}: ${p.puntaje} pts`).join(" | ")}</div>${r.observaciones ? `<div class="history-detail">📝 ${escapeHtml(r.observaciones)}</div>` : ""}</div>`).join("");
}
function renderPatrullas() {
    const div = $("patrullasList");
    if (!patrullas.length) { div.innerHTML = `<p style="text-align:center;color:#8ba888;">No hay patrullas activas.</p>`; return; }
    div.innerHTML = patrullas.map(p => `<div class="patrulla-item"><div class="history-date-header"><span style="color:${p.color}">⚜️ ${escapeHtml(p.nombre)}</span><span>${p.activa ? "Activa" : "Inactiva"}</span></div>${currentMode === "leader" ? `<div class="btn-group"><button class="btn-secondary edit-patrulla" data-id="${p._id}">Editar</button><button class="btn-danger delete-patrulla" data-id="${p._id}">Desactivar</button></div>` : ""}</div>`).join("");
    if (currentMode !== "leader") return;
    document.querySelectorAll(".edit-patrulla").forEach(btn => { btn.onclick = async () => { const p = patrullas.find(x => x._id === btn.dataset.id); const nombre = prompt("Nuevo nombre:", p.nombre); if (!nombre) return; await apiRequest(`/patrullas/${p._id}`, { method: "PUT", body: JSON.stringify({ nombre }) }); await cargarPatrullas(); renderPatrullas(); renderActividades(); }; });
    document.querySelectorAll(".delete-patrulla").forEach(btn => { btn.onclick = async () => { if (!confirm("¿Desactivar esta patrulla? El historial se conserva.")) return; await apiRequest(`/patrullas/${btn.dataset.id}`, { method: "DELETE" }); await cargarPatrullas(); renderPatrullas(); renderActividades(); renderRanking(); }; });
}
async function crearPatrulla() {
    try {
        const nombre = $("nuevaPatrullaNombre").value.trim(); const color = $("nuevaPatrullaColor").value;
        if (!nombre) { alert("Digite el nombre de la patrulla."); return; }
        await apiRequest("/patrullas", { method: "POST", body: JSON.stringify({ nombre, color }) });
        $("nuevaPatrullaNombre").value = ""; await cargarPatrullas(); renderPatrullas(); renderActividades(); renderRanking();
    } catch (error) { alert(error.message); }
}
async function generarReporteMensual() { const data = await apiRequest(`/reportes/mensual/${Number($("reporteAnio").value)}/${Number($("reporteMes").value)}`); $("reporteMensual").innerHTML = renderReporte(data); }
async function generarReporteAnual() { const data = await apiRequest(`/reportes/anual/${Number($("reporteAnualAnio").value)}`); $("reporteAnual").innerHTML = renderReporte(data); }
function renderReporte(data) {
    if (!data.ranking.length) return `<p style="text-align:center;color:#8ba888;">Sin datos para este periodo.</p>`;
    return `<p class="history-detail">Reuniones: ${data.totalReuniones}</p><table class="scores-table report-ranking"><thead><tr><th>POS</th><th>PATRULLA</th><th>PUNTOS</th><th>VICTORIAS</th></tr></thead><tbody>${data.ranking.map((p, i) => `<tr><td>${i + 1}</td><td><strong style="color:${p.color}">${escapeHtml(p.nombrePatrulla)}</strong></td><td><span class="total-score">${p.puntaje}</span></td><td>${p.victorias}</td></tr>`).join("")}</tbody></table>`;
}
function enviarWhatsApp() { const ranking = getRanking(); let msg = "⚜️ TROPA SCOUT 78 ESCAZÚ ⚜️\n\n📊 RESULTADOS:\n"; ranking.forEach((p, i) => msg += `${i + 1}. ${p.nombrePatrulla}: ${p.puntaje} pts\n`); window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank"); }
function exportarCSV() { const ranking = getRanking(); let csv = "Posición,Patrulla,Puntos\n"; ranking.forEach((p, i) => csv += `${i + 1},${p.nombrePatrulla},${p.puntaje}\n`); const blob = new Blob(["\uFEFF" + csv], { type: "text/csv" }); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `tropa78_${Date.now()}.csv`; link.click(); URL.revokeObjectURL(link.href); }
function setupTabs() { document.querySelectorAll(".tab-btn").forEach(btn => { btn.onclick = async () => { const tab = btn.dataset.tab; document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active")); document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active")); btn.classList.add("active"); $(`tab-${tab}`).classList.add("active"); if (tab === "historial") await cargarHistorial(); if (tab === "patrullas") renderPatrullas(); }; }); }
function init() {
    actualizarFecha(); $("fechaReunion").value = hoyISO(); $("reporteAnio").value = new Date().getFullYear(); $("reporteMes").value = new Date().getMonth() + 1; $("reporteAnualAnio").value = new Date().getFullYear();
    $("loginBtn").onclick = login; $("modoScoutBtn").onclick = () => abrirApp("scout"); $("logoutBtn").onclick = salir;
    $("addActivityBtn").onclick = () => { actividades.push(nuevaActividad(`Actividad ${actividades.length + 1}`)); renderActividades(); renderRanking(); };
    $("saveMeetingBtn").onclick = guardarReunion; $("resetMeetingBtn").onclick = reiniciarReunion; $("crearPatrullaBtn").onclick = crearPatrulla;
    $("generarReporteMensualBtn").onclick = generarReporteMensual; $("generarReporteAnualBtn").onclick = generarReporteAnual; $("whatsappBtn").onclick = enviarWhatsApp; $("csvBtn").onclick = exportarCSV;
    setupTabs();
}
init();

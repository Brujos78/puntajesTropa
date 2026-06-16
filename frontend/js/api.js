const API_BASE = "/api";
function getToken() { return sessionStorage.getItem("tropa78_token"); }
function setToken(token) { sessionStorage.setItem("tropa78_token", token); }
function clearToken() { sessionStorage.removeItem("tropa78_token"); }
async function apiRequest(path, options = {}) {
    const headers = options.headers || {};
    headers["Content-Type"] = "application/json";
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Error en la solicitud");
    return data;
}

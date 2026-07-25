// ==========================================
// API HELPER
// ==========================================
// Thin wrapper around fetch() that:
// - prefixes requests with API_BASE_URL
// - attaches the JWT from localStorage automatically
// - redirects to login on 401
// - throws a normal Error with the backend's detail message on failure

const Api = {
  TOKEN_KEY: "acs_token",
  ROLE_KEY: "acs_role",
  NAME_KEY: "acs_name",

  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  },

  setSession({ access_token, role, name }) {
    localStorage.setItem(this.TOKEN_KEY, access_token);
    if (role) localStorage.setItem(this.ROLE_KEY, role);
    if (name) localStorage.setItem(this.NAME_KEY, name);
  },

  clearSession() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    localStorage.removeItem(this.NAME_KEY);
  },

  getRole() {
    return localStorage.getItem(this.ROLE_KEY) || "user";
  },

  getName() {
    return localStorage.getItem(this.NAME_KEY) || "";
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = "index.html";
    }
  },

  requireAdmin() {
    this.requireAuth();
    if (this.getRole() !== "admin") {
      window.location.href = "dashboard.html";
    }
  },

  async request(path, { method = "GET", body = null, isForm = false } = {}) {
    const headers = {};
    const token = this.getToken();

    if (token) headers["Authorization"] = `Bearer ${token}`;

    let fetchBody = undefined;

    if (body !== null) {
      if (isForm) {
        const form = new URLSearchParams();
        Object.entries(body).forEach(([k, v]) => form.append(k, v));
        fetchBody = form;
        headers["Content-Type"] = "application/x-www-form-urlencoded";
      } else {
        fetchBody = JSON.stringify(body);
        headers["Content-Type"] = "application/json";
      }
    }

    let response;
    try {
      response = await fetch(`${window.API_BASE_URL}${path}`, {
        method,
        headers,
        body: fetchBody,
      });
    } catch (networkErr) {
      throw new Error(
        `Could not reach the API at ${window.API_BASE_URL}. Is the backend running?`
      );
    }

    if (response.status === 401) {
      this.clearSession();
      if (!path.startsWith("/login")) {
        window.location.href = "index.html";
      }
    }

    let data = null;
    const text = await response.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!response.ok) {
      const detail =
        (data && (data.detail || data.message)) ||
        `Request failed (${response.status})`;
      throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
    }

    return data;
  },

  get(path) {
    return this.request(path, { method: "GET" });
  },
  post(path, body, opts = {}) {
    return this.request(path, { method: "POST", body, ...opts });
  },
  put(path, body) {
    return this.request(path, { method: "PUT", body });
  },
  patch(path, body) {
    return this.request(path, { method: "PATCH", body });
  },
  del(path) {
    return this.request(path, { method: "DELETE" });
  },
};

function showToast(message, isError = false) {
  let el = document.getElementById("global-toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "global-toast";
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.className = `toast show ${isError ? "error" : ""}`;
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => {
    el.className = "toast";
  }, 3200);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr.endsWith("Z") ? dateStr : dateStr + "Z");
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
